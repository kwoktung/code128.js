import babel from 'rollup-plugin-babel';

export default {
    input: 'src/index.js',
    output: {
      name: 'Code128',
      file: 'dist/index.js',
      format: 'umd'
    },
    plugins: [
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      })
    ]
  };