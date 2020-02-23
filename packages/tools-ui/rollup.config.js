import typescript from 'rollup-plugin-typescript2';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default {
  input: `src/index.ts`,
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
  ],
  watch: { include: 'src/**' },
  plugins: [
    typescript({ useTsconfigDeclarationDir: true }),
    svelte(),
    resolve(),
    json(),
    commonjs({ include: ['./node_modules/prettier/**'] }),
    replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
  ],
  onwarn: function(warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') {
      return;
    }

    console.warn(warning.message);
  },
};
