import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

export default {
  input: `src/index.ts`,
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
  ],
  external: ['@foxtream/core'],
  watch: { include: 'src/**' },
  context: 'globalThis || global || window',
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    resolve(),
    commonjs({
      namedExports: {
        'stacktrace-js': ['get'],
      },
    }),
  ],
};
