const { sync: commandExists } = require('command-exists');
const execa = require('execa');

const log = require('./log');


const runtimeBinaryMap = {
  'python2.7': 'python27',
  'python3.6': 'python36',
};

const runtimePrebuiltMap = {
  'python3.6': {
    repo: 'https://centos6.iuscommunity.org/ius-release.rpm',
    binaryName: 'python3.6',
    packageName: 'python36u',
  },
};


async function downloadAndInstallPython(runtime) {
  log.subheading('Installing python from package');

  if (!(runtime in runtimePrebuiltMap)) {
    throw new Error(`Installing python is not supported for ${runtime}`);
  }

  const { binaryName, packageName, repo } = runtimePrebuiltMap[runtime];

  const repoInstall = await execa('yum', ['install', '-y', repo]);
  log.info(repoInstall.stdout);

  const packInstall = await execa('yum', ['install', '-y', packageName]);
  log.info(packInstall.stdout);

  return binaryName;
}


async function findPythonBinary(runtime) {
  if (!(runtime in runtimeBinaryMap)) {
    throw new Error(`Unable to identify runtime (${runtime})`);
  }

  const binaryName = runtimeBinaryMap[runtime];
  if (commandExists(binaryName)) {
    log.info(`Found matching python (${binaryName})`);
    return binaryName;
  }

  // Attempt to build from source if the binary is not available
  return downloadAndInstallPython(runtime);
}


function validateRuntime(runtime) {
  if (!(runtime in runtimeBinaryMap)) {
    log.error(`Invalid runtime configured (${runtime}). Available runtimes:`);
    Object.keys(runtimeBinaryMap).forEach((key) => {
      log.error(` - ${key}`);
    });
    log.error('See Zeit runtime documentation for more information:');
    log.error('https://zeit.co/docs/v2/deployments/builders/developer-guide#lambdaruntime');
    throw new Error(`Invalid runtime configured (${runtime}).`);
  }
  return true;
}


module.exports = {
  validateRuntime,
  findPythonBinary,
};
