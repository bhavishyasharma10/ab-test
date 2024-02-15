const isFinite = require('lodash.isfinite');
const blueImp = require('blueimp-md5');

const md5 = blueImp.md5 || blueImp;

const initTestConfig = (config) => {
  if (!Array.isArray(config))
    throw new Error('Config must be an array')

  const defaultWeight = 0.5;
  let accumulativeWeight = 0;

  const totalWeight = config.map((test) => {
    return isFinite(test.weight) ? test.weight : defaultWeight;
  }).reduce((acc, weight) => acc + weight);

  const tests = config.map((test) => {
    if (test.name && typeof test.name === 'string') {
      return {
        weight: (isFinite(test.weight) ? test.weight : defaultWeight) / totalWeight,
        name: test.name,
      } 
    }
  }).sort((a, b) => a.weight - b.weight);

  tests.forEach((test) => {
    test.weight += accumulativeWeight;
    accumulativeWeight = test.weight;
  });

  return tests;
}

module.exports ={
  createTest: (name, config) => {
    if (typeof name !== 'string') {
      throw new Error('Name must be a string')
    }

    const testConfig = initTestConfig(config);
    const testName = name;

    const getName = () => testName;

    const getGroup = (userId) => {
      if (userId === undefined || typeof userId !== 'string') {
        throw new Error('userId must be a string');
      }

      const hexMD5Hash = md5(testName, userId).substr(0, 8);
      const hashAsInt = parseInt("0x" + hexMD5Hash, 16);
      const maxInt = parseInt("0xFFFFFFFF", 16);
      const random = hashAsInt / maxInt;

      const filteredTest = testConfig.filter((test) => random < test.weight);
      
      if (filteredTest.length === 0) {
        throw new Error('Error filtering the tests');
      }

      return filteredTest[0].name;
    }

    return {
      getName,
      getGroup
    }
  }
}