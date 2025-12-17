import { useState } from 'react';
import { MessageSquare, Lock, CheckCircle2 } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';
import { arrayToHex, formatTime } from '../utils/sdk-loader';

interface CustomMessageSectionProps {
  sdk: KeySDK | null;
  ecdsaKeyId: string | null;
  mldsaKeyId: string | null;
  onStatsUpdate: () => void;
}

export const CustomMessageSection = ({
  sdk,
  ecdsaKeyId,
  mldsaKeyId,
  onStatsUpdate,
}: CustomMessageSectionProps) => {
  const [message, setMessage] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'ecdsa' | 'mldsa' | 'both'>('both');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [signatures, setSignatures] = useState<{
    ecdsa?: { signature: Uint8Array; time: number };
    mldsa?: { signature: Uint8Array; time: number };
  }>({});

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleSignMessage = async () => {
    if (!sdk || !message.trim()) {
      addLog('❌ Please enter a message to sign', 'error');
      return;
    }

    setIsSigning(true);
    setLogs([]);
    setSignatures({});

    try {
      const messageBytes = new TextEncoder().encode(message);
      addLog(`📝 Message: "${message}"`, 'info');
      addLog(`   Size: ${messageBytes.length} bytes\n`, 'info');

      const newSignatures: typeof signatures = {};

      // Sign with ECDSA
      if ((selectedAlgorithm === 'ecdsa' || selectedAlgorithm === 'both') && ecdsaKeyId) {
        addLog('🔐 Signing with ECDSA...', 'info');
        const startSign = performance.now();
        const signature = await sdk.signWithKey(ecdsaKeyId, messageBytes);
        const signTime = performance.now() - startSign;
        newSignatures.ecdsa = { signature, time: signTime };

        addLog(`✅ ECDSA signature created in ${formatTime(signTime)}`, 'success');
        addLog(`   Size: ${signature.length} bytes`, 'info');
        addLog(`   Hex: ${arrayToHex(signature, 32)}...\n`, 'info');

        // Verify
        const startVerify = performance.now();
        const isValid = await sdk.verifySignature(ecdsaKeyId, messageBytes, signature);
        const verifyTime = performance.now() - startVerify;
        addLog(`${isValid ? '✅' : '❌'} Verification: ${isValid ? 'PASSED' : 'FAILED'} (${formatTime(verifyTime)})\n`, isValid ? 'success' : 'error');
      }

      // Sign with ML-DSA
      if ((selectedAlgorithm === 'mldsa' || selectedAlgorithm === 'both') && mldsaKeyId) {
        addLog('🛡️ Signing with ML-DSA (Post-Quantum)...', 'info');
        const startSign = performance.now();
        const signature = await sdk.signWithKey(mldsaKeyId, messageBytes);
        const signTime = performance.now() - startSign;
        newSignatures.mldsa = { signature, time: signTime };

        addLog(`✅ ML-DSA signature created in ${formatTime(signTime)}`, 'success');
        addLog(`   Size: ${signature.length} bytes`, 'info');
        addLog(`   Hex: ${arrayToHex(signature, 32)}...\n`, 'info');

        // Verify
        const startVerify = performance.now();
        const isValid = await sdk.verifySignature(mldsaKeyId, messageBytes, signature);
        const verifyTime = performance.now() - startVerify;
        addLog(`${isValid ? '✅' : '❌'} Verification: ${isValid ? 'PASSED' : 'FAILED'} (${formatTime(verifyTime)})\n`, isValid ? 'success' : 'error');
      }

      // Comparison
      if (newSignatures.ecdsa && newSignatures.mldsa) {
        addLog('📊 Algorithm Comparison:', 'info');
        addLog(`   ECDSA: ${formatTime(newSignatures.ecdsa.time)}, ${newSignatures.ecdsa.signature.length} bytes`, 'info');
        addLog(`   ML-DSA: ${formatTime(newSignatures.mldsa.time)}, ${newSignatures.mldsa.signature.length} bytes`, 'info');
        const speedRatio = (newSignatures.mldsa.time / newSignatures.ecdsa.time).toFixed(2);
        const sizeRatio = (newSignatures.mldsa.signature.length / newSignatures.ecdsa.signature.length).toFixed(2);
        addLog(`   ML-DSA is ${speedRatio}x slower but quantum-resistant`, 'info');
        addLog(`   ML-DSA signature is ${sizeRatio}x larger`, 'info');
      }

      setSignatures(newSignatures);
      onStatsUpdate();
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsSigning(false);
    }
  };

  const hasRequiredKeys = () => {
    if (selectedAlgorithm === 'ecdsa') return ecdsaKeyId !== null;
    if (selectedAlgorithm === 'mldsa') return mldsaKeyId !== null;
    return ecdsaKeyId !== null && mldsaKeyId !== null;
  };

  return (
    <SectionCard
      title="Sign Custom Message"
      description="Enter your own text and sign it with ECDSA, ML-DSA, or both algorithms"
      icon={<MessageSquare size={24} className="text-purple-500" />}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="custom-message" className="block text-sm font-medium text-slate-700 mb-2">
            Your Message
          </label>
          <textarea
            id="custom-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter any text you want to sign..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={4}
            disabled={!sdk}
          />
          <p className="text-xs text-slate-500 mt-1">
            {message.length} characters • {new TextEncoder().encode(message).length} bytes
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Signature Algorithm
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedAlgorithm('ecdsa')}
              disabled={!ecdsaKeyId}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAlgorithm === 'ecdsa'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Lock size={16} className="inline mr-1" />
              ECDSA Only
            </button>
            <button
              onClick={() => setSelectedAlgorithm('mldsa')}
              disabled={!mldsaKeyId}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAlgorithm === 'mldsa'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <CheckCircle2 size={16} className="inline mr-1" />
              ML-DSA Only
            </button>
            <button
              onClick={() => setSelectedAlgorithm('both')}
              disabled={!ecdsaKeyId || !mldsaKeyId}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAlgorithm === 'both'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Both Algorithms
            </button>
          </div>
        </div>

        <button
          onClick={handleSignMessage}
          disabled={!sdk || !message.trim() || !hasRequiredKeys() || isSigning}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigning ? 'Signing...' : 'Sign Message'}
        </button>

        {!sdk && (
          <p className="text-sm text-amber-600">⚠️ Initialize the SDK first</p>
        )}
        {sdk && !hasRequiredKeys() && (
          <p className="text-sm text-amber-600">⚠️ Create the required keys first</p>
        )}

        {logs.length > 0 && (
          <OutputPanel
            title="Signing Results"
            logs={logs}
            maxHeight="300px"
          />
        )}
      </div>
    </SectionCard>
  );
};
