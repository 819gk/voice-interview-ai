import mongoose from 'mongoose';
import { z } from 'zod';
import { LEVELS, QUESTION_COUNTS, TECHNOLOGIES } from '../config/constants.js';
import { Interview } from '../models/Interview.js';
import {
  evaluateAnswer,
  generateQuestions,
  generateSummary,
} from '../services/ai.service.js';
import { HttpError } from '../utils/HttpError.js';

export const createInterviewSchema = z.object({
  technology: z.enum(TECHNOLOGIES),
  level: z.enum(LEVELS.map((level) => level.value)),
  totalQuestions: z
    .number()
    .int()
    .refine((n) => QUESTION_COUNTS.includes(n), 'Unsupported number of questions.'),
});

export const answerSchema = z.object({
  // An empty string means the candidate skipped the question.
  answer: z.string().trim().max(3000, 'Answer is too long.'),
});

const publicQuestion = (interview, index) => {
  const question = interview.questions[index];
  return question ? { index, text: question.text, topic: question.topic } : null;
};

const resultQuestion = (q) => ({
  id: q.id,
  text: q.text,
  topic: q.topic,
  userAnswer: q.userAnswer ?? '',
  verdict: q.verdict,
  score: q.score,
  feedback: q.feedback,
  correctAnswer: q.correctAnswer,
});

function toInterviewView(interview) {
  const completed = interview.status === 'completed';

  return {
    id: interview.id,
    technology: interview.technology,
    level: interview.level,
    status: interview.status,
    totalQuestions: interview.questions.length,
    currentIndex: interview.currentIndex,
    currentQuestion: completed ? null : publicQuestion(interview, interview.currentIndex),
    createdAt: interview.createdAt,
    ...(completed
      ? {
          totalScore: interview.totalScore,
          summary: interview.summary,
          completedAt: interview.completedAt,
          questions: interview.questions.map(resultQuestion),
        }
      : {}),
  };
}

async function findOwnedInterview(req) {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(404, 'Interview not found.');
  }

  const interview = await Interview.findOne({ _id: id, user: req.user.id });

  if (!interview) {
    throw new HttpError(404, 'Interview not found.');
  }

  return interview;
}

export function getOptions(_req, res) {
  res.json({
    technologies: TECHNOLOGIES,
    levels: LEVELS,
    questionCounts: QUESTION_COUNTS,
  });
}

export async function createInterview(req, res) {
  const { technology, level, totalQuestions } = req.body;
  const questions = await generateQuestions({ technology, level, count: totalQuestions });

  const interview = await Interview.create({
    user: req.user.id,
    technology,
    level,
    questions: questions.map((q) => ({ text: q.question.trim(), topic: q.topic })),
  });

  res.status(201).json(toInterviewView(interview));
}

export async function listInterviews(req, res) {
  const interviews = await Interview.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .select('technology level status totalScore currentIndex completedAt createdAt questions.text');

  res.json({
    interviews: interviews.map((interview) => ({
      id: interview.id,
      technology: interview.technology,
      level: interview.level,
      status: interview.status,
      totalScore: interview.totalScore,
      totalQuestions: interview.questions.length,
      currentIndex: interview.currentIndex,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    })),
  });
}

export async function getInterview(req, res) {
  res.json(toInterviewView(await findOwnedInterview(req)));
}

export async function submitAnswer(req, res) {
  const interview = await findOwnedInterview(req);

  if (interview.status !== 'in_progress') {
    throw new HttpError(409, 'This interview is already completed.');
  }

  const { answer } = req.body;
  const index = interview.currentIndex;
  const question = interview.questions[index];
  const total = interview.questions.length;

  const evaluation = await evaluateAnswer({
    technology: interview.technology,
    level: interview.level,
    question: question.text,
    answer,
  });

  const done = index + 1 >= total;

  const set = {
    [`questions.${index}.userAnswer`]: answer,
    [`questions.${index}.verdict`]: evaluation.verdict,
    [`questions.${index}.score`]: evaluation.score,
    [`questions.${index}.feedback`]: evaluation.feedback,
    [`questions.${index}.correctAnswer`]: evaluation.correctAnswer,
  };

  if (done) {
    const results = interview.questions.map((q, i) =>
      i === index
        ? { topic: q.topic, question: q.text, score: evaluation.score, verdict: evaluation.verdict }
        : { topic: q.topic, question: q.text, score: q.score ?? 0, verdict: q.verdict },
    );
    const totalScore = Math.round(
      (results.reduce((sum, r) => sum + r.score, 0) / (total * 10)) * 100,
    );

    set.status = 'completed';
    set.totalScore = totalScore;
    set.completedAt = new Date();
    set.summary = await generateSummary({
      technology: interview.technology,
      level: interview.level,
      results,
      totalScore,
    });
  }

  // The filter on currentIndex makes the update atomic, so a double-submit cannot save twice.
  const updated = await Interview.findOneAndUpdate(
    { _id: interview._id, user: req.user.id, status: 'in_progress', currentIndex: index },
    { $set: set, $inc: { currentIndex: 1 } },
    { new: true },
  );

  if (!updated) {
    throw new HttpError(409, 'This question was already answered.');
  }

  res.json({
    evaluation: {
      verdict: evaluation.verdict,
      score: evaluation.score,
      feedback: evaluation.feedback,
      correctAnswer: evaluation.correctAnswer,
    },
    completed: done,
    nextQuestion: done ? null : publicQuestion(updated, updated.currentIndex),
    progress: { answered: updated.currentIndex, total },
  });
}
