import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  topic: { type: String, default: '' },
  userAnswer: { type: String },
  verdict: { type: String, enum: ['correct', 'partial', 'incorrect'] },
  score: { type: Number, min: 0, max: 10 },
  feedback: { type: String },
  correctAnswer: { type: String },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    technology: { type: String, required: true },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    questions: { type: [questionSchema], default: [] },
    currentIndex: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    totalScore: { type: Number, min: 0, max: 100 },
    summary: {
      overall: String,
      strengths: [String],
      improvements: [String],
    },
    completedAt: Date,
  },
  { timestamps: true },
);

export const Interview = mongoose.model('Interview', interviewSchema);
