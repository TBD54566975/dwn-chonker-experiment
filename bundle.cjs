const polyfillProviderPlugin = require('node-stdlib-browser/helpers/esbuild/plugin');
const stdLibBrowser = require('node-stdlib-browser');

require('esbuild').build({
  entryPoints: ['./multijank.js'],
  bundle: true,
  format: 'esm',
  outfile: 'dist/multijank.js',
  sourcemap: true,
  platform: 'browser',
  target: ['chrome101', 'firefox108', 'safari16'],
  inject: [require.resolve('node-stdlib-browser/helpers/esbuild/shim')],
  plugins: [polyfillProviderPlugin(stdLibBrowser)],
  define: {
    'global': 'globalThis'
  }
})