import { useState } from 'react';
import { PenTool, Layers } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';
import { arrayToHex, formatTime } from '../utils/sdk-loader';

interface SigningSectionProps {
  sdk: KeySDK | null;
  ecdsaKeyId: string | null;
  mldsaKeyId: string | null;
  onStatsUpdate: () => void;
}

export const SigningSection = ({ sdk, ecdsaKeyId, mldsaKeyId, onStatsUpdate }: SigningSectionProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigningBoth, setIsSigningBoth] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleSignAndVerify = async () => {
    if (!sdk) return;
    setIsSigning(true);
    setLogs([]);

    try {
      const keyId = ecdsaKeyId || mldsaKeyId;
      if (!keyId) return;

      const message = new TextEncoder().encode('Hello from the browser! 🌐');

      addLog(`Signing message with key ${keyId}...`, 'info');

      const startSign = performance.now();
      const signature = await sdk.signWithKey(keyId, message);
      const signTime = performance.now() - startSign;

      addLog(`✅ Signature created in ${formatTime(signTime)}`, 'success');
      addLog(`   Signature size: ${signature.length} bytes`, 'info');
      const hex = arrayToHex(signature, 32);
      addLog(`   Signature (first 32 bytes hex): ${hex}...`, 'info');

      addLog('\nVerifying signature...', 'info');

      const startVerify = performance.now();
      const isValid = await sdk.verifySignature(keyId, message, signature);
      const verifyTime = performance.now() - startVerify;

      if (isValid) {
        addLog(`✅ Signature verified in ${formatTime(verifyTime)}`, 'success');
      } else {
        addLog('❌ Signature verification failed!', 'error');
      }

      onStatsUpdate();
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSigning(false);
    }
  };

  const handleSignWithBoth = async () => {
    if (!sdk || !ecdsaKeyId || !mldsaKeyId) return;
    setIsSigningBoth(true);
    setLogs([]);

    try {
      const message = new TextEncoder().encode('Hybrid signature test message');

      addLog('Creating signatures with both algorithms...', 'info');

      addLog('\n📝 ECDSA Signing...', 'info');
      const ecdsaStart = performance.now();
      const ecdsaSig = await sdk.signWithKey(ecdsaKeyId, message);
      const ecdsaTime = performance.now() - ecdsaStart;

      addLog(`✅ ECDSA: ${formatTime(ecdsaTime)}, ${ecdsaSig.length} bytes`, 'success');

      addLog('\n📝 ML-DSA Signing...', 'info');
      const mldsaStart = performance.now();
      const mldsaSig = await sdk.signWithKey(mldsaKeyId, message);
      const mldsaTime = performance.now() - mldsaStart;

      addLog(`✅ ML-DSA: ${formatTime(mldsaTime)}, ${mldsaSig.length} bytes`, 'success');

      addLog('\n📊 Comparison:', 'info');
      addLog(`   ECDSA: ${formatTime(ecdsaTime)}, ${ecdsaSig.length} bytes`, 'info');
      addLog(`   ML-DSA: ${formatTime(mldsaTime)}, ${mldsaSig.length} bytes`, 'info');
      addLog(`   Size ratio: ${(mldsaSig.length / ecdsaSig.length).toFixed(2)}x`, 'info');

      onStatsUpdate();
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSigningBoth(false);
    }
  };

  const hasAnyKey = ecdsaKeyId || mldsaKeyId;
  const hasBothKeys = ecdsaKeyId && mldsaKeyId;

  return (
    <SectionCard title="3. Sign & Verify" icon={<PenTool size={24} />}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSignAndVerify}
            disabled={!sdk || !hasAnyKey || isSigning}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <PenTool size={20} />
            {isSigning ? 'Signing...' : 'Sign & Verify Message'}
          </button>

          <button
            onClick={handleSignWithBoth}
            disabled={!sdk || !hasBothKeys || isSigningBoth}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Layers size={20} />
            {isSigningBoth ? 'Signing...' : 'Sign with Both Algorithms'}
          </button>
        </div>

        <OutputPanel logs={logs} />
      </div>
    </SectionCard>
  );
};
