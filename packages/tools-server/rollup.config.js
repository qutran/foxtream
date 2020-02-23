import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import { copySync } from 'fs-extra';
import path from 'path';
import pkg from './package.json';

copySync('./view/', './dist/view');

const ts = typescript({ useTsconfigDeclarationDir: true });

const server = {
  input: 'src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
  ],
  plugins: [ts],
  external: [...Object.keys(pkg.dependencies), 'http', 'path', 'url'],
  watch: { include: 'src/**' },
};

const client = {
  input: 'view/client.ts',
  output: {
    file: path.join(pkg.module, '../../view', 'client.mjs'),
    format: 'es',
  },
  plugins: [resolve(), ts],
  watch: { include: 'view/client.ts' },
};

export default [server, client];
