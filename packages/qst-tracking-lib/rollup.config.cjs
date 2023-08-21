/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const pkg = require('./package.json');

const banner = `/**
 * qst-tracking-lib v${pkg.version}
 * Copyright ${new Date().getFullYear()} Mutueye. Licensed under MIT
 */
`;

const resolve = (_path) => path.resolve(__dirname, _path);

const outputList = [
  {
    file: resolve('dist/index.min.js'),
    format: 'umd',
    name: 'qst-ui-system',
    banner,
    min: true,
    sourcemap: false,
  },
  {
    file: pkg.main,
    format: 'cjs',
    banner,
    min: true,
    sourcemap: false,
  },
  {
    file: pkg.module,
    format: 'es',
    banner,
    min: true,
    sourcemap: false,
  },
];

module.exports = outputList.map((outputData) => {
  const output = {
    file: outputData.file,
    format: outputData.format,
    banner: outputData.banner,
    sourcemap: outputData.sourcemap,
  };
  if (outputData.name) output.name = outputData.name;

  return {
    input: resolve('src/index.ts'),
    output,
    plugins: [typescript({ tsconfig: './tsconfig.json' }), outputData.min ? terser() : null],
  };
});
