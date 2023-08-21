/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
// const glob = require('glob');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const css = require('rollup-plugin-import-css');
const pkg = require('./package.json');
// const copy = require('rollup-plugin-copy');

const banner = `/**
 * qst-ui-system v${pkg.version}
 * Copyright ${new Date().getFullYear()} Mutueye. Licensed under MIT
 */
`;

const resolve = (_path) => path.resolve(__dirname, _path);

const outputList = [
  // {
  //   file: resolve('dist/index.min.js'),
  //   format: 'umd',
  //   name: 'qst-ui-system',
  //   banner,
  //   min: true,
  //   sourcemap: false,
  // },
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
    globals: {
      color2k: 'color2k',
    },
    sourcemap: outputData.sourcemap,
  };
  if (outputData.name) output.name = outputData.name;

  return {
    external: ['color2k'],
    input: resolve('src/index.ts'),
    output,
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      css({ minify: true }),
      // copy({
      //   targets: [{ src: 'src/styles/element-theme.scss', dest: 'dist' }],
      // }),
      outputData.min ? terser() : null,
    ],
  };
});
