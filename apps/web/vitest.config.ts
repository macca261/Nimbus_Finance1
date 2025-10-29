import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: { environment: 'node' },
  resolve: {
    alias: {
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/components': path.resolve(__dirname, 'components')
    }
  }
});


