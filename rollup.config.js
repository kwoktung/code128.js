import babel from 'rollup-plugin-babel';

const plugins = [
  babel({
    exclude: 'node_modules/**' // only transpile our source code
  })
]

export default [
  {
    // browser build, exposes `window.Code128`
    input: 'src/index.js',
    output: {
      name: 'Code128',
      file: 'dist/index.js',
      format: 'umd'
    },
    plugins
  },
  {
    // environment-agnostic core (Node, workers, custom renderers)
    input: 'src/core.js',
    output: {
      file: 'dist/core.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins
  },
  {
    // React Native build, picked up by Metro via the "react-native" field
    input: 'src/native.js',
    external: ['react', 'react-native'],
    output: {
      file: 'dist/native.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins
  }
];
