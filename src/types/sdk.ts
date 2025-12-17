export type SignatureSuite = 'bsv-ecdsa-secp256k1' | 'ml-dsa-44' | 'ml-dsa-65' | 'ml-dsa-87';

export interface KeyMeta {
  keyId: string;
  suiteId: SignatureSuite;
  usage: string[];
  status: 'active' | 'inactive';
}

export interface KeyRecord {
  meta: KeyMeta;
  publicKey: Uint8Array;
}

export interface KeySDK {
  createKey: (agentId: string, options: { primarySignatureSuite: SignatureSuite }) => Promise<KeyRecord>;
  signWithKey: (keyId: string, message: Uint8Array) => Promise<Uint8Array>;
  verifySignature: (keyId: string, message: Uint8Array, signature: Uint8Array) => Promise<boolean>;
  listKeysForAgent: (agentId: string, activeOnly?: boolean) => Promise<KeyRecord[]>;
}

export interface LumenKeysGlobal {
  createKeySDK: () => Promise<KeySDK>;
}

declare global {
  interface Window {
    LumenKeys?: LumenKeysGlobal;
  }
}

export interface Stats {
  keysCreated: number;
  signaturesCreated: number;
  verifications: number;
}

export type LogType = 'info' | 'success' | 'error';

export interface LogEntry {
  timestamp: string;
  message: string;
  type: LogType;
}
