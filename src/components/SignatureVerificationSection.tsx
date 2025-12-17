import { useState } from 'react';
import { CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';
import { formatTime } from '../utils/sdk-loader';

interface SignatureVerificationSectionProps {
  sdk: KeySDK | null;
}

export const SignatureVerificationSection = ({ sdk }: SignatureVerificationSectionProps) => {
  const [message, setMessage] = useState('');
  const [publicKeyHex, setPublicKeyHex] = useState('');
  const [signatureHex, setSignatureHex] = useState('');
  const [algorithm, setAlgorithm] = useState<'ecdsa' | 'mldsa'>('ecdsa');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'valid' | 'invalid' | null>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const hexToUint8Array = (hex: string): Uint8Array => {
    const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  };

  const handleVerifySignature = async () => {
    if (!sdk || !message || !publicKeyHex || !signatureHex) {
      addLog('❌ Please fill in all fields', 'error');
      return;
    }

    setIsVerifying(true);
    setLogs([]);
    setVerificationResult(null);

    try {
      addLog('🔍 Starting signature verification...', 'info');
      
      // Convert inputs
      const messageBytes = new TextEncoder().encode(message);
      addLog(`📝 Message: "${message}" (${messageBytes.length} bytes)`, 'info');

      const publicKey = hexToUint8Array(publicKeyHex);
      addLog(`🔑 Public key: ${publicKey.length} bytes`, 'info');

      const signature = hexToUint8Array(signatureHex);
      addLog(`✍️ Signature: ${signature.length} bytes`, 'info');

      // Import the public key
      addLog(`\n📥 Importing ${algorithm.toUpperCase()} public key...`, 'info');
      const keyId = await sdk.importPublicKey(publicKey, algorithm);
      addLog(`✅ Key imported with ID: ${keyId}`, 'success');

      // Verify the signature
      addLog('\n🔐 Verifying signature...', 'info');
      const startVerify = performance.now();
      const isValid = await sdk.verifySignature(keyId, messageBytes, signature);
      const verifyTime = performance.now() - startVerify;

      if (isValid) {
        addLog(`✅ SIGNATURE VALID - Verified in ${formatTime(verifyTime)}`, 'success');
        addLog('🎉 The signature is authentic and matches the message!', 'success');
        setVerificationResult('valid');
      } else {
        addLog(`❌ SIGNATURE INVALID - Checked in ${formatTime(verifyTime)}`, 'error');
        addLog('⚠️ The signature does not match the message or key', 'error');
        setVerificationResult('invalid');
      }

      addLog(`\n📊 Algorithm: ${algorithm.toUpperCase()}`, 'info');
      addLog(`⏱️ Verification time: ${formatTime(verifyTime)}`, 'info');
      
    } catch (error) {
      addLog(`❌ Verification error: ${(error as Error).message}`, 'error');
      setVerificationResult('invalid');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoadExample = () => {
    setMessage('Hello from the browser! 🌐');
    setAlgorithm('ecdsa');
    addLog('💡 Example data loaded - Create keys and export to get actual values', 'info');
  };

  return (
    <SectionCard
      title="Verify External Signature"
      description="Verify signatures from external sources using public keys"
      icon={<Shield size={24} className="text-indigo-500" />}
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="verify-message" className="block text-sm font-medium text-slate-700 mb-2">
            Message
          </label>
          <textarea
            id="verify-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter the original message that was signed..."
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={3}
            disabled={!sdk}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Algorithm
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setAlgorithm('ecdsa')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                algorithm === 'ecdsa'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ECDSA
            </button>
            <button
              onClick={() => setAlgorithm('mldsa')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                algorithm === 'mldsa'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              ML-DSA (PQ)
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="verify-pubkey" className="block text-sm font-medium text-slate-700 mb-2">
            Public Key (Hex)
          </label>
          <textarea
            id="verify-pubkey"
            value={publicKeyHex}
            onChange={(e) => setPublicKeyHex(e.target.value)}
            placeholder="Paste the public key in hexadecimal format..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            rows={3}
            disabled={!sdk}
          />
        </div>

        <div>
          <label htmlFor="verify-signature" className="block text-sm font-medium text-slate-700 mb-2">
            Signature (Hex)
          </label>
          <textarea
            id="verify-signature"
            value={signatureHex}
            onChange={(e) => setSignatureHex(e.target.value)}
            placeholder="Paste the signature in hexadecimal format..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
            rows={3}
            disabled={!sdk}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleVerifySignature}
            disabled={!sdk || !message || !publicKeyHex || !signatureHex || isVerifying}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            {isVerifying ? 'Verifying...' : 'Verify Signature'}
          </button>
          <button
            onClick={handleLoadExample}
            disabled={!sdk}
            className="px-4 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Load Example
          </button>
        </div>

        {!sdk && (
          <p className="text-sm text-amber-600">⚠️ Initialize the SDK first</p>
        )}

        {verificationResult === 'valid' && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Signature Valid!</p>
              <p className="text-sm text-green-700">The signature is authentic and verified successfully.</p>
            </div>
          </div>
        )}

        {verificationResult === 'invalid' && (
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Signature Invalid!</p>
              <p className="text-sm text-red-700">The signature could not be verified. Check your inputs.</p>
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <OutputPanel
            title="Verification Log"
            logs={logs}
            maxHeight="250px"
          />
        )}
      </div>
    </SectionCard>
  );
};
