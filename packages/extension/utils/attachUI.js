const path = require('path');
const fs = require('fs-extra');

const uiPath = path.join(
  require.resolve('@foxtream/tools-ui'),
  '../../esm/index.mjs',
);

fs.copyFileSync(uiPath, './src/devtools/devtoolsUI.mjs');
