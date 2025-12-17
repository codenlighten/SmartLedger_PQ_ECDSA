import { useState } from 'react';
import { Download, Upload, Key, Copy, Check } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';
import { arrayToHex } from '../utils/sdk-loader';

interface KeyExportSectionProps {
  sdk: KeySDK | null;
  ecdsaKeyId: string | null;
  mldsaKeyId: string | null;
}

export const KeyExportSection = ({ sdk, ecdsaKeyId, mldsaKeyId }: KeyExportSectionProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [publicKeys, setPublicKeys] = useState<{ ecdsa?: string; mldsa?: string }>({});
  const [copied, setCopied] = useState<string | null>(null);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleExportPublicKeys = async () => {
    if (!sdk) return;
    setLogs([]);
    setPublicKeys({});

    try {
      const keys: typeof publicKeys = {};

      if (ecdsaKeyId) {
        addLog('📤 Exporting ECDSA public key...', 'info');
        const pubKey = await sdk.getPublicKey(ecdsaKeyId);
        const hex = arrayToHex(pubKey);
        keys.ecdsa = hex;
        addLog(`✅ ECDSA Public Key (${pubKey.length} bytes):`, 'success');
        addLog(`   ${hex.substring(0, 64)}...`, 'info');
      }

      if (mldsaKeyId) {
        addLog('\n📤 Exporting ML-DSA public key...', 'info');
        const pubKey = await sdk.getPublicKey(mldsaKeyId);
        const hex = arrayToHex(pubKey);
        keys.mldsa = hex;
        addLog(`✅ ML-DSA Public Key (${pubKey.length} bytes):`, 'success');
        addLog(`   ${hex.substring(0, 64)}...`, 'info');
      }

      setPublicKeys(keys);
      addLog('\n✅ Public keys exported successfully', 'success');
      addLog('💡 These can be shared for signature verification', 'info');
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      addLog(`❌ Failed to copy: ${(error as Error).message}`, 'error');
    }
  };

  const handleDownloadKeys = () => {
    const data = {
      exported: new Date().toISOString(),
      keys: publicKeys,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartledger-pq-keys-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('✅ Public keys downloaded as JSON', 'success');
  };

  return (
    <SectionCard
      title="Export Public Keys"
      description="Export and share your public keys for signature verification"
      icon={<Key size={24} className="text-teal-500" />}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={handleExportPublicKeys}
            disabled={!sdk || (!ecdsaKeyId && !mldsaKeyId)}
            className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            Export Public Keys
          </button>
          {(publicKeys.ecdsa || publicKeys.mldsa) && (
            <button
              onClick={handleDownloadKeys}
              className="px-4 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <Download size={20} />
              Download JSON
            </button>
          )}
        </div>

        {!sdk && (
          <p className="text-sm text-amber-600">⚠️ Initialize the SDK first</p>
        )}
        {sdk && !ecdsaKeyId && !mldsaKeyId && (
          <p className="text-sm text-amber-600">⚠️ Create at least one key pair first</p>
        )}

        {publicKeys.ecdsa && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-900">ECDSA Public Key</h4>
              <button
                onClick={() => handleCopy(publicKeys.ecdsa!, 'ecdsa')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
              >
                {copied === 'ecdsa' ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy
                  </>
                )}
              </button>
            </div>
            <code className="text-xs text-blue-800 break-all block">
              {publicKeys.ecdsa}
            </code>
          </div>
        )}

        {publicKeys.mldsa && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-900">ML-DSA Public Key</h4>
              <button
                onClick={() => handleCopy(publicKeys.mldsa!, 'mldsa')}
                className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
              >
                {copied === 'mldsa' ? (
                  <>
                    <Check size={16} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy
                  </>
                )}
              </button>
            </div>
            <code className="text-xs text-green-800 break-all block">
              {publicKeys.mldsa}
            </code>
          </div>
        )}

        {logs.length > 0 && (
          <OutputPanel
            title="Export Log"
            logs={logs}
            maxHeight="200px"
          />
        )}
      </div>
    </SectionCard>
  );
};
