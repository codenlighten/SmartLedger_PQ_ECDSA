export const loadSDKFromCDN = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.LumenKeys) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@smartledger/keys@1.5.1/dist/lumen-keys.min.js';
    script.async = true;

    script.onload = () => {
      if (window.LumenKeys) {
        resolve();
      } else {
        reject(new Error('LumenKeys SDK failed to load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load SDK from CDN'));
    };

    document.head.appendChild(script);
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const formatTime = (ms: number): string => {
  return `${ms.toFixed(2)}ms`;
};

export const arrayToHex = (arr: Uint8Array, length: number = 32): string => {
  return Array.from(arr.slice(0, length))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
