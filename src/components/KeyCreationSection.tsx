import { useState } from 'react';
import { Key, Shield } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK, SignatureSuite } from '../types/sdk';
import { arrayToHex } from '../utils/sdk-loader';

interface KeyCreationSectionProps {
  sdk: KeySDK | null;
  onKeyCreated: (keyId: string, type: 'ecdsa' | 'mldsa') => void;
  onStatsUpdate: () => void;
}

export const KeyCreationSection = ({ sdk, onKeyCreated, onStatsUpdate }: KeyCreationSectionProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [mldsaVariant, setMldsaVariant] = useState<SignatureSuite>('ml-dsa-65');
  const [isCreatingEcdsa, setIsCreatingEcdsa] = useState(false);
  const [isCreatingMldsa, setIsCreatingMldsa] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleCreateECDSA = async () => {
    if (!sdk) return;
    setIsCreatingEcdsa(true);

    try {
      addLog('Creating ECDSA key...', 'info');

      const keyRecord = await sdk.createKey('BrowserAgent', {
        primarySignatureSuite: 'bsv-ecdsa-secp256k1',
      });

      addLog('✅ ECDSA key created!', 'success');
      addLog(`   Key ID: ${keyRecord.meta.keyId}`, 'info');
      addLog(`   Suite: ${keyRecord.meta.suiteId}`, 'info');
      const hex = arrayToHex(keyRecord.publicKey, 16);
      addLog(`   Public Key (first 16 bytes): ${hex}...`, 'info');

      onKeyCreated(keyRecord.meta.keyId, 'ecdsa');
      onStatsUpdate();
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsCreatingEcdsa(false);
    }
  };

  const handleCreateMLDSA = async () => {
    if (!sdk) return;
    setIsCreatingMldsa(true);

    try {
      const variantNames = {
        'ml-dsa-44': 'ML-DSA-44 (Level 2, fastest)',
        'ml-dsa-65': 'ML-DSA-65 (Level 3, balanced)',
        'ml-dsa-87': 'ML-DSA-87 (Level 5, maximum security)',
      };

      addLog(`Creating ${variantNames[mldsaVariant]} key...`, 'info');
      addLog('⏳ Initializing WASM module...', 'info');

      const keyRecord = await sdk.createKey('BrowserAgent', {
        primarySignatureSuite: mldsaVariant,
      });

      addLog('✅ ML-DSA key created!', 'success');
      addLog(`   Key ID: ${keyRecord.meta.keyId}`, 'info');
      addLog(`   Suite: ${keyRecord.meta.suiteId}`, 'info');
      addLog(`   Public Key Size: ${keyRecord.publicKey.length} bytes`, 'info');
      addLog('   This is QUANTUM-RESISTANT! 🛡️', 'success');

      onKeyCreated(keyRecord.meta.keyId, 'mldsa');
      onStatsUpdate();
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsCreatingMldsa(false);
    }
  };

  return (
    <SectionCard title="2. Create Keys" icon={<Key size={24} />}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateECDSA}
            disabled={!sdk || isCreatingEcdsa}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Key size={20} />
            {isCreatingEcdsa ? 'Creating...' : 'Create ECDSA Key (Bitcoin)'}
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="ml-dsa-variant" className="block text-sm font-medium text-slate-700 mb-2">
              ML-DSA Variant:
            </label>
            <select
              id="ml-dsa-variant"
              value={mldsaVariant}
              onChange={(e) => setMldsaVariant(e.target.value as SignatureSuite)}
              disabled={!sdk}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="ml-dsa-44">ML-DSA-44 (Level 2, fastest, smallest signatures)</option>
              <option value="ml-dsa-65">ML-DSA-65 (Level 3, balanced - recommended)</option>
              <option value="ml-dsa-87">ML-DSA-87 (Level 5, maximum security)</option>
            </select>
          </div>

          <button
            onClick={handleCreateMLDSA}
            disabled={!sdk || isCreatingMldsa}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <Shield size={20} />
            {isCreatingMldsa ? 'Creating...' : 'Create ML-DSA Key (Post-Quantum)'}
          </button>
        </div>

        <OutputPanel logs={logs} />
      </div>
    </SectionCard>
  );
};
