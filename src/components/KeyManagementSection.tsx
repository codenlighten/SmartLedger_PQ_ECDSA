import { useState } from 'react';
import { FolderKey, RotateCw, User } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { OutputPanel } from './OutputPanel';
import { LogEntry, KeySDK } from '../types/sdk';

interface KeyManagementSectionProps {
  sdk: KeySDK | null;
  ecdsaKeyId: string | null;
  mldsaKeyId: string | null;
  onKeysRotated: (ecdsaKeyId: string | null, mldsaKeyId: string | null) => void;
  onStatsUpdate: () => void;
}

export const KeyManagementSection = ({
  sdk,
  ecdsaKeyId,
  mldsaKeyId,
  onKeysRotated,
  onStatsUpdate,
}: KeyManagementSectionProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isListing, setIsListing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isGettingProfile, setIsGettingProfile] = useState(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const handleListKeys = async () => {
    if (!sdk) return;
    setIsListing(true);
    setLogs([]);

    try {
      addLog('Listing keys for BrowserAgent...', 'info');

      const keys = await sdk.listKeysForAgent('BrowserAgent');

      addLog(`\n✅ Found ${keys.length} key(s):`, 'success');

      keys.forEach((key, index) => {
        addLog(`\n${index + 1}. ${key.meta.keyId}`, 'info');
        addLog(`   Suite: ${key.meta.suiteId}`, 'info');
        addLog(`   Usage: ${key.meta.usage.join(', ')}`, 'info');
        addLog(`   Status: ${key.meta.status}`, 'info');
        addLog(`   Public Key Size: ${key.publicKey.length} bytes`, 'info');
      });
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsListing(false);
    }
  };

  const handleRotateKeys = async () => {
    if (!sdk) return;
    setIsRotating(true);
    setLogs([]);

    try {
      addLog('Rotating keys for BrowserAgent...', 'info');
      addLog('Creating new keys...', 'info');

      const newKeys = [];
      let newEcdsaKeyId = null;
      let newMldsaKeyId = null;

      if (ecdsaKeyId) {
        const newEcdsa = await sdk.createKey('BrowserAgent', {
          primarySignatureSuite: 'bsv-ecdsa-secp256k1',
        });
        newKeys.push(newEcdsa);
        newEcdsaKeyId = newEcdsa.meta.keyId;
      }

      if (mldsaKeyId) {
        const newMldsa = await sdk.createKey('BrowserAgent', {
          primarySignatureSuite: 'ml-dsa-65',
        });
        newKeys.push(newMldsa);
        newMldsaKeyId = newMldsa.meta.keyId;
      }

      addLog(`\n✅ Created ${newKeys.length} new key(s):`, 'success');

      newKeys.forEach((key, index) => {
        addLog(`\n${index + 1}. ${key.meta.keyId}`, 'info');
        addLog(`   Suite: ${key.meta.suiteId}`, 'info');
      });

      addLog('\n✅ Keys rotated successfully', 'success');

      onKeysRotated(newEcdsaKeyId, newMldsaKeyId);
      onStatsUpdate();
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsRotating(false);
    }
  };

  const handleGetProfile = async () => {
    if (!sdk) return;
    setIsGettingProfile(true);
    setLogs([]);

    try {
      addLog('Getting key profile...', 'info');

      const keys = await sdk.listKeysForAgent('BrowserAgent', true);
      const activeKeys = keys.filter((k) => k.meta.status === 'active');

      addLog('\n✅ Active Keys Profile:', 'success');
      addLog(`   Total active keys: ${activeKeys.length}`, 'info');

      const hasEcdsa = activeKeys.some((k) => k.meta.suiteId === 'bsv-ecdsa-secp256k1');
      const hasMldsa = activeKeys.some((k) => k.meta.suiteId.startsWith('ml-dsa'));

      if (hasEcdsa && hasMldsa) {
        addLog('\n🛡️ Hybrid mode: Maximum security!', 'success');
        addLog('   • Classical ECDSA for current compatibility', 'info');
        addLog('   • Post-quantum ML-DSA for future-proofing', 'info');
      } else if (hasMldsa) {
        addLog('\n🛡️ Post-quantum only: Future-ready!', 'success');
      } else if (hasEcdsa) {
        addLog('\n📝 Classical only: Standard ECDSA', 'info');
      } else {
        addLog('\n⚠️ No active keys', 'info');
      }
    } catch (error) {
      addLog(`❌ Error: ${(error as Error).message}`, 'error');
    } finally {
      setIsGettingProfile(false);
    }
  };

  const hasAnyKey = ecdsaKeyId || mldsaKeyId;

  return (
    <SectionCard title="4. Key Management" icon={<FolderKey size={24} />}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleListKeys}
            disabled={!sdk || !hasAnyKey || isListing}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <FolderKey size={20} />
            {isListing ? 'Listing...' : 'List All Keys'}
          </button>

          <button
            onClick={handleRotateKeys}
            disabled={!sdk || !hasAnyKey || isRotating}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <RotateCw size={20} />
            {isRotating ? 'Rotating...' : 'Rotate Agent Keys'}
          </button>

          <button
            onClick={handleGetProfile}
            disabled={!sdk || !hasAnyKey || isGettingProfile}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <User size={20} />
            {isGettingProfile ? 'Loading...' : 'Get Crypto Profile'}
          </button>
        </div>

        <OutputPanel logs={logs} />
      </div>
    </SectionCard>
  );
};
