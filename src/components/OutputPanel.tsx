import { LogEntry } from '../types/sdk';

interface OutputPanelProps {
  logs: LogEntry[];
  className?: string;
}

export const OutputPanel = ({ logs, className = '' }: OutputPanelProps) => {
  return (
    <div
      className={`bg-slate-900 rounded-lg p-4 font-mono text-sm max-h-96 overflow-y-auto ${className}`}
    >
      {logs.length === 0 ? (
        <div className="text-slate-500">No output yet...</div>
      ) : (
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span
                className={`${
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'error'
                    ? 'text-red-400'
                    : 'text-cyan-400'
                }`}
              >
                [{log.timestamp}]
              </span>
              <span
                className={`${
                  log.type === 'success'
                    ? 'text-emerald-300'
                    : log.type === 'error'
                    ? 'text-red-300'
                    : 'text-slate-300'
                } break-all`}
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
