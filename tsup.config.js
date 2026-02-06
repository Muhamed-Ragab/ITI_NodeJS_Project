// tsup.config.js
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.js'],
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  format: ['esm'],
  dts: false, // Not generating TypeScript declaration files for a pure JS project
});
