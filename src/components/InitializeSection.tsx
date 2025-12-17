import { useState } from 'react';
import { Power, Loader2 } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';
import { loadSDKFromCDN } from '../utils/sdk-loader';

interface InitializeSectionProps {
  onInitialized: (sdk: KeySDK) => void;
}

export const InitializeSection = ({ onInitialized }: InitializeSectionProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleInitialize = async () => {
    setIsLoading(true);
    setLogs([]);

    try {
      addLog('Loading SDK from CDN...', 'info');
      await loadSDKFromCDN();

      addLog('Creating KeySDK instance...', 'info');
      if (!window.LumenKeys) {
        throw new Error('LumenKeys SDK not available');
      }

      const sdk = await window.LumenKeys.createKeySDK();

      addLog('✅ SDK initialized successfully!', 'success');
      addLog('Available features:', 'info');
      addLog('  • ECDSA signatures (secp256k1)', 'info');
      addLog('  • ML-DSA signatures (Post-Quantum)', 'info');
      addLog('  • Hybrid signing support', 'info');
      addLog('  • Key lifecycle management', 'info');

      setIsInitialized(true);
      onInitialized(sdk);
    } catch (error) {
      addLog(`❌ Initialization failed: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectionCard title="1. Initialize SDK" icon={<Power size={24} />}>
      <div className="space-y-4">
        <button
          onClick={handleInitialize}
          disabled={isLoading || isInitialized}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            isInitialized
              ? 'bg-emerald-500 text-white cursor-default'
              : isLoading
              ? 'bg-slate-400 text-white cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={20} className="animate-spin" />
              Initializing...
            </span>
          ) : isInitialized ? (
            '✅ Initialized'
          ) : (
            'Initialize SDK'
          )}
        </button>
        <OutputPanel logs={logs} />
      </div>
    </SectionCard>
  );
};
