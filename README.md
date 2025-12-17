# 🔐 SmartLedger PQ SDK - Interactive Demo

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)

> **Enterprise-grade Post-Quantum Cryptography SDK** - Interactive browser demonstration of SmartLedger's quantum-resistant cryptographic capabilities with ECDSA and ML-DSA (Post-Quantum) signatures.

## 🌟 Overview

SmartLedger PQ SDK provides a complete, browser-based demonstration of cutting-edge cryptographic capabilities, featuring both classical ECDSA and post-quantum ML-DSA signature algorithms. This interactive demo showcases the SDK's powerful features for enterprise and government applications requiring quantum-resistant security.

### ✨ Key Features

- 🔑 **Dual Algorithm Support** - Classical ECDSA (secp256k1) and Post-Quantum ML-DSA signatures
- 🛡️ **Quantum-Resistant Security** - Future-proof cryptography against quantum computing threats
- 🌐 **100% Browser-Based** - No backend required, runs entirely client-side
- ⚡ **High Performance** - Optimized for speed with WASM acceleration
- 🔐 **Complete Cryptographic Workflow** - Key generation, signing, verification, and management
- 📦 **Lightweight** - Only 230.5 KB minified bundle
- 🎯 **Production Ready** - Enterprise-grade code quality and security

## 🚀 Live Demo

### React Application
Experience the full interactive demo with React UI components:
- **Deploy**: Build and deploy the `/dist` folder to any static hosting service
- **Local**: Run `npm install && npm run dev`

### Standalone HTML Demo
Single-file demo that works anywhere:
- Open `sl-pq-demo-browser.html` directly in your browser
- No build step or server required
- Perfect for presentations and quick demonstrations

## 📋 Features Showcase

### 1️⃣ SDK Initialization
Load and initialize the SmartLedger PQ SDK with a single click. The SDK automatically configures:
- ECDSA signature suite (secp256k1)
- ML-DSA-44, ML-DSA-65, and ML-DSA-87 variants
- WASM modules for optimal performance
- Hybrid cryptographic capabilities

### 2️⃣ Key Generation
Create cryptographic key pairs for both algorithms:
- **ECDSA Keys** - Industry-standard Bitcoin-compatible signatures
- **ML-DSA Keys** - NIST-standardized post-quantum cryptography
  - ML-DSA-44 (Level 2) - Fastest, smallest signatures
  - ML-DSA-65 (Level 3) - Balanced performance (recommended)
  - ML-DSA-87 (Level 5) - Maximum security

### 3️⃣ Message Signing & Verification
Sign and verify messages with real-time performance metrics:
- Pre-configured test messages
- Custom user-provided text
- Signature size comparison
- Timing benchmarks
- Hybrid dual-algorithm signing

### 4️⃣ Custom Message Signing
Interactive text input for signing your own content:
- Multi-line text support
- Character and byte counter
- Algorithm selection (ECDSA, ML-DSA, or both)
- Instant signature generation and verification
- Performance comparison between algorithms

### 5️⃣ Public Key Export
Export and share public keys for signature verification:
- Hexadecimal format output
- Copy to clipboard functionality
- Download as JSON file
- Ready for cross-party verification

### 6️⃣ External Signature Verification
Verify signatures from external sources:
- Import public keys (hex format)
- Paste signatures for verification
- Support for both ECDSA and ML-DSA
- Real-time validation feedback
- Perfect for cross-party authentication

### 7️⃣ Browser Key Storage
Demonstrate persistent storage capabilities:
- Save keys to localStorage
- Storage size tracking
- Key retrieval and management
- Clear storage functionality
- *Note: Demo purposes only - production systems should use secure key management*

### 8️⃣ Key Management
Complete key lifecycle management:
- List all active keys
- Key rotation capabilities
- Cryptographic profile analysis
- Status monitoring
- Usage tracking

### 9️⃣ Performance Benchmarking
Comprehensive performance testing:
- Batch key generation tests
- Signing throughput measurement
- Verification speed analysis
- Algorithm comparison metrics
- Real-world performance data

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **SDK**: @smartledger/keys v1.5.1
- **Cryptography**: 
  - ECDSA (secp256k1)
  - ML-DSA (NIST FIPS 204)
  - WebAssembly acceleration

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/codenlighten/SmartLedger_PQ_ECDSA.git
cd SmartLedger_PQ_ECDSA

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Usage Examples

### Initialize the SDK
```javascript
const sdk = await LumenKeys.createKeySDK();
```

### Create an ECDSA Key
```javascript
const ecdsaKey = await sdk.createKey('MyAgent', {
  primarySignatureSuite: 'bsv-ecdsa-secp256k1'
});
```

### Create a Post-Quantum ML-DSA Key
```javascript
const mldsaKey = await sdk.createKey('MyAgent', {
  primarySignatureSuite: 'ml-dsa-65'
});
```

### Sign a Message
```javascript
const message = new TextEncoder().encode('Hello, quantum-safe world!');
const signature = await sdk.signWithKey(keyId, message);
```

### Verify a Signature
```javascript
const isValid = await sdk.verifySignature(keyId, message, signature);
console.log('Signature valid:', isValid);
```

### Export Public Key
```javascript
const publicKey = await sdk.getPublicKey(keyId);
const hexKey = Array.from(publicKey)
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
```

## 🏗️ Project Structure

```
├── public/
│   └── favicon.svg              # Custom SmartLedger PQ favicon
├── src/
│   ├── components/
│   │   ├── InitializeSection.tsx           # SDK initialization
│   │   ├── KeyCreationSection.tsx          # Key generation UI
│   │   ├── SigningSection.tsx              # Basic signing demos
│   │   ├── CustomMessageSection.tsx        # Custom text signing
│   │   ├── KeyExportSection.tsx            # Public key export
│   │   ├── SignatureVerificationSection.tsx # External sig verification
│   │   ├── KeyStorageSection.tsx           # Browser storage demo
│   │   ├── KeyManagementSection.tsx        # Key lifecycle management
│   │   ├── PerformanceSection.tsx          # Benchmarking tools
│   │   ├── OutputPanel.tsx                 # Log display component
│   │   ├── SectionCard.tsx                 # UI card wrapper
│   │   └── StatsCard.tsx                   # Statistics display
│   ├── types/
│   │   └── sdk.ts                          # TypeScript definitions
│   ├── utils/
│   │   └── sdk-loader.ts                   # SDK utilities
│   ├── App.tsx                             # Main application
│   ├── main.tsx                            # Application entry
│   └── index.css                           # Global styles
├── sl-pq-demo-browser.html     # Standalone HTML demo
├── index.html                  # React app entry
├── package.json                # Dependencies
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## 🔒 Security Features

- **Quantum-Resistant Algorithms** - ML-DSA based on NIST FIPS 204
- **Classical Compatibility** - ECDSA secp256k1 for current standards
- **Hybrid Signatures** - Dual-algorithm signing for maximum security
- **Browser Isolation** - All cryptographic operations run client-side
- **No Data Transmission** - Private keys never leave your browser
- **Open Source** - Transparent, auditable code

## 📊 Performance Benchmarks

Typical performance on modern hardware:

| Operation | ECDSA | ML-DSA-65 |
|-----------|-------|-----------|
| Key Generation | ~2ms | ~5ms |
| Signing | ~0.5ms | ~2ms |
| Verification | ~0.7ms | ~2.5ms |
| Public Key Size | 33 bytes | 1,952 bytes |
| Signature Size | 64 bytes | 3,309 bytes |

*Note: ML-DSA provides quantum resistance at the cost of larger signature sizes*

## 🌐 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

Requires WebAssembly support and modern JavaScript (ES2020+).

## 🤝 Use Cases

- **Enterprise Security** - Quantum-resistant document signing
- **Government Applications** - Future-proof identity management
- **Blockchain Integration** - Dual-algorithm transaction signing
- **Digital Signatures** - Legal document authentication
- **IoT Security** - Lightweight cryptographic operations
- **Supply Chain** - Tamper-proof data integrity
- **Healthcare** - HIPAA-compliant secure communications

## 📚 Documentation

For complete SDK documentation, visit:
- [SmartLedger.Technology](https://smartledger.technology)
- [SDK API Documentation](https://www.npmjs.com/package/@smartledger/keys)

## 🏢 About SmartLedger

SmartLedger.Technology is a leader in blockchain and distributed ledger solutions, providing enterprise-grade security and scalability for government and commercial applications. Our quantum-resistant cryptography solutions ensure your systems remain secure in the post-quantum era.

### Key Solutions:
- 🛡️ **Sovereign Shield** - Military-grade cybersecurity
- 🔐 **CERTIHASH Sentinel Node** - AI-enhanced blockchain security
- 🆔 **SmartLedger Identity** - Self-sovereign digital identity (W3C DID compliant)
- 💰 **SmartLedger Interchange** - Revolutionary micropayments platform
- 📊 **Data Integrity Solutions** - Immutable audit trails

### Certifications & Compliance:
- ✅ USFCR Verified Vendor
- ✅ NIST Compliance
- ✅ W3C DID Standards
- ✅ Enterprise Security Certified

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

### Standalone HTML Deployment
Simply upload `sl-pq-demo-browser.html` to any web server - no build step required!

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **Website**: [SmartLedger.Technology](https://smartledger.technology)
- **Email**: YourFriends@smartledger.solutions
- **Phone**: +1 (650) 507-4250
- **GitHub**: [@codenlighten](https://github.com/codenlighten)

## 🙏 Acknowledgments

- NIST for ML-DSA standardization (FIPS 204)
- Bitcoin SV blockchain community
- Open-source cryptography contributors
- WebAssembly working group

---

<div align="center">

**Built with ❤️ by SmartLedger.Technology**

*Securing the future with quantum-resistant cryptography*

[Website](https://smartledger.technology) • [Documentation](https://smartledger.technology) • [Contact](mailto:YourFriends@smartledger.solutions)

</div>
