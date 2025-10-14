// Shim for assert module in React Native
// This provides a minimal implementation of Node.js assert module

const AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || `${this.actual} ${this.operator} ${this.expected}`;
  this.generatedMessage = !options.message;
  Error.captureStackTrace(this, options.stackStartFunction);
};

AssertionError.prototype = Object.create(Error.prototype);
AssertionError.prototype.constructor = AssertionError;
AssertionError.prototype.name = 'AssertionError';

const assert = function assert(value, message) {
  if (!value) {
    throw new AssertionError({
      actual: value,
      expected: true,
      operator: '==',
      message: message,
      stackStartFunction: assert
    });
  }
};

// Add assertion methods
assert.ok = assert;

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) {
    throw new AssertionError({
      actual: actual,
      expected: expected,
      operator: '==',
      message: message,
      stackStartFunction: equal
    });
  }
};

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new AssertionError({
      actual: actual,
      expected: expected,
      operator: '===',
      message: message,
      stackStartFunction: strictEqual
    });
  }
};

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    throw new AssertionError({
      actual: actual,
      expected: expected,
      operator: '!=',
      message: message,
      stackStartFunction: notEqual
    });
  }
};

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    throw new AssertionError({
      actual: actual,
      expected: expected,
      operator: '!==',
      message: message,
      stackStartFunction: notStrictEqual
    });
  }
};

assert.fail = function fail(message) {
  throw new AssertionError({
    message: message,
    stackStartFunction: fail
  });
};

// Export the assert object
if (typeof module !== 'undefined' && module.exports) {
  module.exports = assert;
}

// Also attach to global if needed
if (typeof global !== 'undefined') {
  global.assert = assert;
}

export default assert;