import { useState } from 'react';
import { Zap } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';
import { formatTime } from '../utils/sdk-loader';

interface PerformanceSectionProps {
  sdk: KeySDK | null;
}

export const PerformanceSection = ({ sdk }: PerformanceSectionProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleRunPerformanceTest = async () => {
    if (!sdk) return;
    setIsRunning(true);
    setLogs([]);

    try {
      addLog('🏃 Running performance test...', 'info');
      addLog('Testing 10 key creations and 100 sign/verify operations\n', 'info');

      const message = new TextEncoder().encode('Performance test message');
      const iterations = 100;

      addLog('📊 ECDSA Performance:', 'info');

      const ecdsaKeyStart = performance.now();
      for (let i = 0; i < 10; i++) {
        await sdk.createKey(`PerfAgent${i}`, { primarySignatureSuite: 'bsv-ecdsa-secp256k1' });
      }
      const ecdsaKeyTime = performance.now() - ecdsaKeyStart;
      addLog(
        `   Key creation (10x): ${formatTime(ecdsaKeyTime)} (${formatTime(ecdsaKeyTime / 10)} avg)`,
        'info'
      );

      const testKey = await sdk.createKey('PerfTest', { primarySignatureSuite: 'bsv-ecdsa-secp256k1' });

      const ecdsaSignStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await sdk.signWithKey(testKey.meta.keyId, message);
      }
      const ecdsaSignTime = performance.now() - ecdsaSignStart;
      addLog(
        `   Signing (${iterations}x): ${formatTime(ecdsaSignTime)} (${formatTime(ecdsaSignTime / iterations)} avg)`,
        'info'
      );

      const sig = await sdk.signWithKey(testKey.meta.keyId, message);
      const ecdsaVerifyStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        await sdk.verifySignature(testKey.meta.keyId, message, sig);
      }
      const ecdsaVerifyTime = performance.now() - ecdsaVerifyStart;
      addLog(
        `   Verification (${iterations}x): ${formatTime(ecdsaVerifyTime)} (${formatTime(
          ecdsaVerifyTime / iterations
        )} avg)`,
        'success'
      );

      addLog('\n✅ Performance test complete!', 'success');
      addLog('\n💡 Throughput:', 'info');
      addLog(`   • ${Math.round((iterations * 1000) / ecdsaSignTime)} signatures/sec`, 'info');
      addLog(`   • ${Math.round((iterations * 1000) / ecdsaVerifyTime)} verifications/sec`, 'info');
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <SectionCard title="5. Performance Test" icon={<Zap size={24} />}>
      <div className="space-y-4">
        <button
          onClick={handleRunPerformanceTest}
          disabled={!sdk || isRunning}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <Zap size={20} />
          {isRunning ? 'Running Test...' : 'Run Performance Test'}
        </button>

        <OutputPanel logs={logs} />
      </div>
    </SectionCard>
  );
};
