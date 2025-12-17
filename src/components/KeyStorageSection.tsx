import { useState, useEffect } from 'react';
import { Database, Save, Trash2, RefreshCw } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';

interface KeyStorageSectionProps {
  sdk: KeySDK | null;
  ecdsaKeyId: string | null;
  mldsaKeyId: string | null;
}

interface StoredKeyData {
  id: string;
  algorithm: string;
  publicKey: string;
  created: string;
}

const STORAGE_KEY = 'smartledger-pq-keys';

export const KeyStorageSection = ({ sdk, ecdsaKeyId, mldsaKeyId }: KeyStorageSectionProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [storedKeys, setStoredKeys] = useState<StoredKeyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const loadStoredKeys = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const keys = JSON.parse(stored);
        setStoredKeys(keys);
        addLog(`📂 Loaded ${keys.length} key(s) from browser storage`, 'success');
      } else {
        setStoredKeys([]);
        addLog('📂 No keys found in storage', 'info');
      }
    } catch (error) {
      addLog(`❌ Error loading keys: ${(error as Error).message}`, 'error');
    }
  };

  useEffect(() => {
    loadStoredKeys();
  }, []);

  const handleSaveKeys = async () => {
    if (!sdk) return;
    setIsLoading(true);
    setLogs([]);

    try {
      const keysToStore: StoredKeyData[] = [];

      if (ecdsaKeyId) {
        addLog('💾 Saving ECDSA key...', 'info');
        const publicKey = await sdk.getPublicKey(ecdsaKeyId);
        const hex = Array.from(publicKey)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        keysToStore.push({
          id: ecdsaKeyId,
          algorithm: 'ECDSA',
          publicKey: hex,
          created: new Date().toISOString(),
        });
        addLog('✅ ECDSA key saved', 'success');
      }

      if (mldsaKeyId) {
        addLog('💾 Saving ML-DSA key...', 'info');
        const publicKey = await sdk.getPublicKey(mldsaKeyId);
        const hex = Array.from(publicKey)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        keysToStore.push({
          id: mldsaKeyId,
          algorithm: 'ML-DSA',
          publicKey: hex,
          created: new Date().toISOString(),
        });
        addLog('✅ ML-DSA key saved', 'success');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(keysToStore));
      setStoredKeys(keysToStore);
      addLog(`\n✅ Saved ${keysToStore.length} key(s) to browser storage`, 'success');
      addLog('💡 Keys persist across page refreshes', 'info');
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStoredKeys([]);
    setLogs([]);
    addLog('🗑️ Storage cleared', 'success');
  };

  const getStorageSize = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return '0 bytes';
    const bytes = new Blob([stored]).size;
    if (bytes < 1024) return `${bytes} bytes`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <SectionCard
      title="Browser Key Storage"
      description="Persist public keys in browser localStorage for demonstration purposes"
      icon={<Database size={24} className="text-orange-500" />}
    >
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>⚠️ Demo Only:</strong> This demonstrates browser storage capabilities. In production,
            private keys should never be stored in localStorage. Use secure key management systems.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Keys in Storage</p>
            <p className="text-2xl font-bold text-slate-900">{storedKeys.length}</p>
          </div>
          <div className="bg-slate-100 rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Storage Used</p>
            <p className="text-2xl font-bold text-slate-900">{getStorageSize()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveKeys}
            disabled={!sdk || (!ecdsaKeyId && !mldsaKeyId) || isLoading}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isLoading ? 'Saving...' : 'Save Keys'}
          </button>
          <button
            onClick={loadStoredKeys}
            className="px-4 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Reload
          </button>
          <button
            onClick={handleClearStorage}
            disabled={storedKeys.length === 0}
            className="px-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 size={20} />
            Clear
          </button>
        </div>

        {!sdk && (
          <p className="text-sm text-amber-600">⚠️ Initialize the SDK first</p>
        )}
        {sdk && !ecdsaKeyId && !mldsaKeyId && (
          <p className="text-sm text-amber-600">⚠️ Create at least one key pair first</p>
        )}

        {storedKeys.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-700">Stored Keys:</h4>
            {storedKeys.map((key, index) => (
              <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">{key.algorithm}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(key.created).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-1">ID: {key.id}</p>
                <code className="text-xs text-slate-700 break-all block">
                  {key.publicKey.substring(0, 64)}...
                </code>
              </div>
            ))}
          </div>
        )}

        {logs.length > 0 && (
          <OutputPanel
            title="Storage Log"
            logs={logs}
            maxHeight="200px"
          />
        )}
      </div>
    </SectionCard>
  );
};
