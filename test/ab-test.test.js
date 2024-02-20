const { createTest } = require('../index');

const localStorageMock = require('jest-localstorage-mock');

describe('createTest function', () => {
  beforeEach(() => {
    localStorage.clear(); // Clear local storage before each test
  });
  
  afterEach(() => {
    localStorage.clear(); // Clear local storage after each test
  });

  test('creates a test with default hash method', () => {
    const test = createTest('testName', [{ name: 'test1' }, { name: 'test2', weight: 0.2 }]);
    expect(test.getName()).toBe('testName');
    expect(test.getGroup('userId')).toBeDefined();
  });

  test('creates a test with specified hash method', () => {
    const test = createTest('testName', [{ name: 'test1' }, { name: 'test2', weight: 0.2 }], { hashMethod: 'murmur3' });
    expect(test.getName()).toBe('testName');
    expect(test.getGroup('userId')).toBeDefined();
  });

  test('create a test to check distribution of md5 hash method', () => {
    const test = createTest('testName', [{ name: 'test1' }, { name: 'test2' }], { hashMethod: 'md5' });
    
    expect(test.getName()).toBe('testName');

    let test1Count = 0;
    let test2Count = 0;
    const total = 100000;

    for (let i = 1; i < total; i++) {
      if (test.getGroup(i.toString()) === 'test1') {
        test1Count++;
      } else {
        test2Count++;
      }
    }

    expect(test1Count).toBeGreaterThan(48000);
    expect(test2Count).toBeGreaterThan(48000);

    expect(test1Count + test2Count).toBe(total-1);

    /* Now with 1000 random user IDs. Each user ID should be less than 100000 and greater than 0 */

    let test1Count2 = 0;
    let test2Count2 = 0;
    const total2 = 1000;

    for (let i = 1; i < total2; i++) {
      const userId = Math.floor(Math.random() * 100000) + 1;
      if (test.getGroup(userId.toString()) === 'test1') {
        test1Count2++;
      } else {
        test2Count2++;
      }
    }

    expect(test1Count2).toBeGreaterThan(400);
    expect(test2Count2).toBeGreaterThan(400);

    expect(test1Count2 + test2Count2).toBe(total2-1);
  });

  test('create a test to check distribution of murmur3 hash method', () => {
    const test = createTest('testName', [{ name: 'test1' }, { name: 'test2' }], { hashMethod: 'murmur3' });
    
    expect(test.getName()).toBe('testName');

    
    let test1Count = 0;
    let test2Count = 0;
    const total = 100000;

    for (let i = 1; i < total; i++) {
      if (test.getGroup(i.toString()) === 'test1') {
        test1Count++;
      } else {
        test2Count++;
      }
    }
    
    expect(test1Count).toBeGreaterThan(48000);
    expect(test2Count).toBeGreaterThan(48000);

    expect(test1Count + test2Count).toBe(total-1);

    /* Now with 1000 random user IDs. Each user ID should be less than 100000 and greater than 0 */

    let test1Count2 = 0;
    let test2Count2 = 0;
    const total2 = 1000;

    for (let i = 1; i < total2; i++) {
      const userId = Math.floor(Math.random() * 100000) + 1;
      if (test.getGroup(userId.toString()) === 'test1') {
        test1Count2++;
      } else {
        test2Count2++;
      }
    }

    expect(test1Count2).toBeGreaterThan(400);
    expect(test2Count2).toBeGreaterThan(400);

    expect(test1Count2 + test2Count2).toBe(total2-1);
  });
  

  test('throws error when name is not a string', () => {
    expect(() => {
      createTest(123, [{ name: 'test1' }]);
    }).toThrow('Name must be a string');
  });
});

