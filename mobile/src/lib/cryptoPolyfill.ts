// crypto-js (and some other libraries) call crypto.getRandomValues, which is
// missing or throws in React Native. Patch it with expo-crypto before use.
import * as ExpoCrypto from 'expo-crypto';

type CryptoLike = {
  getRandomValues?: <T extends ArrayBufferView>(array: T) => T;
  [key: string]: unknown;
};

let fallbackActive = false;

function install(): void {
  const scope = globalThis as unknown as { crypto?: CryptoLike };
  if (!scope.crypto) scope.crypto = {};

  const cryptoObject = scope.crypto;
  const original =
    typeof cryptoObject.getRandomValues === 'function'
      ? cryptoObject.getRandomValues.bind(cryptoObject)
      : null;

  const patched = <T extends ArrayBufferView>(array: T): T => {
    if (original) {
      try {
        return original(array);
      } catch {
        // React Native's shim can exist but throw; fall through.
      }
    }
    if (fallbackActive) {
      throw new Error('Secure random fallback recursion');
    }
    fallbackActive = true;
    try {
      const bytes = ExpoCrypto.getRandomBytes(array.byteLength);
      new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(bytes);
      return array;
    } finally {
      fallbackActive = false;
    }
  };

  try {
    cryptoObject.getRandomValues = patched;
  } catch {
    try {
      Object.defineProperty(scope, 'crypto', {
        value: { ...cryptoObject, getRandomValues: patched },
        configurable: true,
        writable: true,
      });
    } catch {
      // Last resort: leave it; encryption will fall back to plaintext cache.
    }
  }
}

install();
