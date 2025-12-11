const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Banner with version
const banner = `/**
 * ScrollMarks v${pkg.version}
 * A library to colorize the scrollbar based on element positions
 * @license MIT
 */`;

async function build() {
  console.log(`Building ScrollMarks v${pkg.version}...\n`);

  const commonOptions = {
    entryPoints: ['src/scroll-marks.js'],
    bundle: true,
    target: ['es2018'],
    define: {
      '__VERSION__': `"${pkg.version}"`
    }
  };

  // UMD build (unminified)
  await esbuild.build({
    ...commonOptions,
    outfile: 'dist/scroll-marks.js',
    format: 'iife',
    globalName: 'ScrollMarksModule',
    footer: {
      js: ';(function(m){if(typeof module!=="undefined"&&module.exports)module.exports=m.ScrollMarks||m.default||m;if(typeof window!=="undefined")window.ScrollMarks=m.ScrollMarks||m.default||m;})(ScrollMarksModule);'
    },
    banner: { js: banner },
  });
  console.log('✓ dist/scroll-marks.js');

  // UMD build (minified)
  const result = await esbuild.build({
    ...commonOptions,
    outfile: 'dist/scroll-marks.min.js',
    format: 'iife',
    globalName: 'ScrollMarksModule',
    minify: true,
    footer: {
      js: ';(function(m){if(typeof module!=="undefined"&&module.exports)module.exports=m.ScrollMarks||m.default||m;if(typeof window!=="undefined")window.ScrollMarks=m.ScrollMarks||m.default||m;})(ScrollMarksModule);'
    },
    banner: { js: banner },
    metafile: true,
  });
  
  const minSize = Object.values(result.metafile.outputs)[0].bytes;
  console.log(`✓ dist/scroll-marks.min.js (${(minSize / 1024).toFixed(2)} KB)`);

  // ESM build
  await esbuild.build({
    ...commonOptions,
    outfile: 'dist/scroll-marks.esm.js',
    format: 'esm',
    banner: { js: banner },
  });
  console.log('✓ dist/scroll-marks.esm.js');

  // Copy TypeScript definitions
  fs.copyFileSync(
    path.join(__dirname, '..', 'src', 'scroll-marks.d.ts'),
    path.join(distDir, 'scroll-marks.d.ts')
  );
  console.log('✓ dist/scroll-marks.d.ts');

  console.log('\nBuild complete!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
