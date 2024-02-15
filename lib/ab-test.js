const isFinite = require('lodash.isfinite');
const blueImp = require('blueimp-md5');
const {v3} = require('murmurhash');
const md5 = blueImp.md5 || blueImp;
const availableHashMethods = ['md5', 'murmur3'];

const setLocalStorage = (key, value) => {
  if (typeof key !== 'string' || typeof value !== 'string') {
    throw new Error('Key and value must be strings');
  }

  localStorage.setItem(key, value);
}

const getLocalStorage = (key) => {
  if (typeof key !== 'string') {
    throw new Error('Key must be a string');
  }

  return JSON.parse(localStorage.getItem(key));
}

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
  createTest: (name, config, options) => {
    if (typeof name !== 'string') {
      throw new Error('Name must be a string')
    }

    const storedTest = getLocalStorage(testLocalStorageKey);
    const testConfig = initTestConfig(config);
    const testName = name;
    const testLocalStorageKey = 'ab_test_group';
    let hashMethod = 'md5';

    if (options && options.hashMethod && availableHashMethods.includes(options.hashMethod)) {
      hashMethod = options.hashMethod;
    }

    const getName = () => testName;

    const getGroup = (userId) => {
      if (userId === undefined || typeof userId !== 'string') {
        throw new Error('userId must be a string');
      }


      if (storedTest && storedTest.name === testName) {
        return storedTest.group;
      } else {
        const maxInt = parseInt("0xFFFFFFFF", 16);

        if (hashMethod === 'md5') {
          const hexMD5Hash = md5(testName, userId).substr(0, 8);
          const hashAsInt = parseInt("0x" + hexMD5Hash, 16);
          const random = hashAsInt / maxInt;
    
          const filteredTest = testConfig.filter((test) => random < test.weight);
          
          if (filteredTest.length === 0) {
            throw new Error('Error filtering the tests');
          }
  
          setLocalStorage(testLocalStorageKey, JSON.stringify({
            name: testName,
            group: filteredTest[0].name
          }));
    
          return filteredTest[0].name;
        } else {
          const hash = v3(testName + userId, 0);
          const hashAsInt = parseInt(hash, 16);
          const random = hashAsInt / maxInt;

          const filteredTest = testConfig.filter((test) => random < test.weight);
          
          if (filteredTest.length === 0) {
            throw new Error('Error filtering the tests');
          }
  
          setLocalStorage(testLocalStorageKey, JSON.stringify({
            name: testName,
            group: filteredTest[0].name
          }));
    
          return filteredTest[0].name;
        }
      }
    }

    return {
      getName,
      getGroup
    }
  }
}