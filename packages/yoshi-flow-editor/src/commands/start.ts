import path from 'path';
import arg from 'arg';
import fs from 'fs-extra';
import chalk from 'chalk';
import { TARGET_DIR, BUILD_DIR } from 'yoshi-config/paths';
import DevEnvironment from 'yoshi-common/dev-environment';
import { cliCommand } from '../bin/yoshi-flow-editor';
import {
  createClientWebpackConfig,
  createServerWebpackConfig,
  createWebWorkerWebpackConfig,
} from '../webpack.config';
import {
  buildEditorPlatformEntries,
  buildViewerScriptEntry,
  webWorkerExternals,
} from '../buildEditorEntires';

const join = (...dirs: Array<string>) => path.join(process.cwd(), ...dirs);

const start: cliCommand = async function(argv, config, model) {
  const args = arg(
    {
      // Types
      '--help': Boolean,
      '--server': String,
      '--url': String,
      '--production': Boolean,
      '--https': Boolean,
      '--debug': Boolean,
      '--debug-brk': Boolean,
    },
    { argv },
  );

  const {
    '--help': help,
    '--url': url,
    '--production': shouldRunAsProduction,
    '--https': shouldUseHttps = true,
  } = args;

  if (help) {
    console.log(
      `
      Description
        Starts the application in development mode

      Usage
        $ yoshi-app start

      Options
        --help, -h      Displays this message
        --url           Opens the browser with the supplied URL
        --production    Start using unminified production build
        --https         Serve the app bundle on https
        --debug         Allow app-server debugging
        --debug-brk     Allow app-server debugging, process won't start until debugger will be attached
    `,
    );

    process.exit(0);
  }

  console.log(chalk.cyan('Starting development environment...\n'));

  if (shouldRunAsProduction) {
    process.env.BABEL_ENV = 'production';
    process.env.NODE_ENV = 'production';
  }

  await Promise.all([
    fs.emptyDir(join(BUILD_DIR)),
    fs.emptyDir(join(TARGET_DIR)),
  ]);

  const clientConfig = createClientWebpackConfig(config, {
    isDev: true,
    isHot: true,
    customEntry: buildEditorPlatformEntries(model),
  });

  const serverConfig = createServerWebpackConfig(config, {
    isDev: true,
    isHot: true,
  });

  const webWorkerConfig = createWebWorkerWebpackConfig(config, {
    isDev: true,
    isHot: true,
    customEntry: buildViewerScriptEntry(model),
    webWorkerExternals,
  });

  const devEnvironment = await DevEnvironment.create({
    webpackConfigs: [clientConfig, serverConfig, webWorkerConfig],
    https: shouldUseHttps,
    webpackDevServerPort: 3200,
    appName: config.name,
    serverFilePath: 'node_modules/yoshi-flow-editor/build/server/server.js',
    startUrl: url || [
      `https://localhost:3000/todoEditorApp`,
      'https://localhost:3000/todoSettingsPanel',
    ],
    enableClientHotUpdates: true,
  });

  await devEnvironment.start();
};

export default start;
