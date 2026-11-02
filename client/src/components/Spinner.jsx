export default function Spinner({ label = 'Loading...', fullScreen = false }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 text-slate-400 ${
        fullScreen ? 'min-h-screen' : 'py-16'
      }`}
    >
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-400" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
