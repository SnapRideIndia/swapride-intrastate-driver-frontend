import { createMMKV } from 'react-native-mmkv';

// To enable at-rest encryption: createMMKV({ id: 'swapride-driver', encryptionKey: 'your-key' })
export const storage = createMMKV({ id: 'swapride-driver' });
