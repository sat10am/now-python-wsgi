const { sync: commandExists } = require('command-exists');
const execa = require('execa');

const log = require('./log');


const runtimeBinaryMap = {
  'python2.7': 'python27',
  'python3.6': 'python36',
};


const fallbackBinaryMap = {
  python36: 'python3',
};


async function findPythonBinary(runtime) {
  if (!(runtime in runtimeBinaryMap)) {
    throw new Error(`Unable to identify runtime (${runtime})`);
  }

  const binaryName = runtimeBinaryMap[runtime];
  if (commandExists(binaryName)) {
    log.info(`Found matching python (${binaryName})`);
    return binaryName;
  }

  // TODO: If binary is not found, attempt install

  if (!(binaryName in fallbackBinaryMap)) {
    throw new Error(`Unable to find fallback binary for ${binaryName}`);
  }
  const fallbackBinary = fallbackBinaryMap[binaryName];
  log.warning(`Unable to find matching python for ${binaryName}, falling back `
              + `to ${fallbackBinary}`);
  const fallbackVersion = await execa(fallbackBinary, ['--version']);
  log.warning(`${fallbackBinary} is ${fallbackVersion.stdout}`);
  return fallbackBinary;
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
