import { useState } from 'react';
import { Shield, Key, PenTool, TrendingUp } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { InitializeSection } from './components/InitializeSection';
import { KeyCreationSection } from './components/KeyCreationSection';
import { SigningSection } from './components/SigningSection';
import { CustomMessageSection } from './components/CustomMessageSection';
import { KeyExportSection } from './components/KeyExportSection';
import { SignatureVerificationSection } from './components/SignatureVerificationSection';
import { KeyStorageSection } from './components/KeyStorageSection';
import { KeyManagementSection } from './components/KeyManagementSection';
import { PerformanceSection } from './components/PerformanceSection';
import { KeySDK, Stats } from './types/sdk';

function App() {
  const [sdk, setSdk] = useState<KeySDK | null>(null);
  const [ecdsaKeyId, setEcdsaKeyId] = useState<string | null>(null);
  const [mldsaKeyId, setMldsaKeyId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    keysCreated: 0,
    signaturesCreated: 0,
    verifications: 0,
  });

  const handleKeyCreated = (keyId: string, type: 'ecdsa' | 'mldsa') => {
    if (type === 'ecdsa') {
      setEcdsaKeyId(keyId);
    } else {
      setMldsaKeyId(keyId);
    }
    setStats((prev) => ({ ...prev, keysCreated: prev.keysCreated + 1 }));
  };

  const handleStatsUpdate = () => {
    setStats((prev) => ({
      ...prev,
      signaturesCreated: prev.signaturesCreated + 1,
      verifications: prev.verifications + 1,
    }));
  };

  const handleKeysRotated = (newEcdsaKeyId: string | null, newMldsaKeyId: string | null) => {
    if (newEcdsaKeyId) {
      setEcdsaKeyId(newEcdsaKeyId);
      setStats((prev) => ({ ...prev, keysCreated: prev.keysCreated + 1 }));
    }
    if (newMldsaKeyId) {
      setMldsaKeyId(newMldsaKeyId);
      setStats((prev) => ({ ...prev, keysCreated: prev.keysCreated + 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-600" size={40} />
            <h1 className="text-4xl font-bold text-slate-900">SmartLedger PQ SDK</h1>
          </div>
          <p className="text-lg text-slate-600 max-w-3xl">
            Full cryptographic SDK with ECDSA and ML-DSA (Post-Quantum) support running entirely in your browser. Quantum-resistant security for enterprise and government.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard value="230.5 KB" label="Bundle Size (minified)" icon={<TrendingUp size={24} />} />
          <StatsCard value={stats.keysCreated} label="Keys Created" icon={<Key size={24} />} />
          <StatsCard value={stats.signaturesCreated} label="Signatures Created" icon={<PenTool size={24} />} />
          <StatsCard value={stats.verifications} label="Verifications" icon={<Shield size={24} />} />
        </div>

        <div className="space-y-6">
          <InitializeSection onInitialized={setSdk} />

          <KeyCreationSection sdk={sdk} onKeyCreated={handleKeyCreated} onStatsUpdate={handleStatsUpdate} />

          <SigningSection
            sdk={sdk}
            ecdsaKeyId={ecdsaKeyId}
            mldsaKeyId={mldsaKeyId}
            onStatsUpdate={handleStatsUpdate}
          />

          <CustomMessageSection
            sdk={sdk}
            ecdsaKeyId={ecdsaKeyId}
            mldsaKeyId={mldsaKeyId}
            onStatsUpdate={handleStatsUpdate}
          />

          <KeyExportSection
            sdk={sdk}
            ecdsaKeyId={ecdsaKeyId}
            mldsaKeyId={mldsaKeyId}
          />

          <SignatureVerificationSection sdk={sdk} />

          <KeyStorageSection
            sdk={sdk}
            ecdsaKeyId={ecdsaKeyId}
            mldsaKeyId={mldsaKeyId}
          />

          <KeyManagementSection
            sdk={sdk}
            ecdsaKeyId={ecdsaKeyId}
            mldsaKeyId={mldsaKeyId}
            onKeysRotated={handleKeysRotated}
            onStatsUpdate={handleStatsUpdate}
          />

          <PerformanceSection sdk={sdk} />
        </div>

        <footer className="mt-12 text-center text-slate-600 text-sm pb-8">
          <p>Powered by SmartLedger PQ SDK v1.5.1 • Loaded via CDN</p>
          <p className="mt-1">
            Demonstrating classical ECDSA and post-quantum ML-DSA cryptography in React
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
