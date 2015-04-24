var chai = require('chai'),
  assert = chai.assert,
  Address = require('./../address').Address,
  isAddressValid = require('./../address').isAddressValid,
  isMaskValid = require('./../address').isMaskValid,
  octetToBinary = require('./../address').octetToBinary,
  stringToBinary = require('./../address').stringToBinary;


//Determine whether or not we can tell if an address is valid
suite('Address Validation', function() {
  test('Has to have 4 sections separated by periods', function() {
    assert.throws(function() {
      isAddressValid('1.2.3')
    }, Error);
    assert.throws(function() {
      isAddressValid('1.2.3.')
    });
    assert.throws(function() {
      isAddressValid('1.2.3.4.')
    });
    assert.throws(function() {
      isAddressValid('1.2.3.4.5.')
    });
  });
  test('First section cannot be zero', function() {
    assert.throws(function() {
      isAddressValid('0.1.2.3')
    }, Error);
  });
  test('Each section has 1 to 3 digits', function() {
    //Too many digits
    assert.throws(function() {
      isAddressValid('1000.2.3.4')
    }, Error);
    assert.throws(function() {
      isAddressValid('1.2000.3.4')
    }, Error);
    assert.throws(function() {
      isAddressValid('1.2.3000.4')
    }, Error);
    assert.throws(function() {
      isAddressValid('1.2.3.4000')
    }, Error);
    //Not enough digits
    assert.throws(function() {
      isAddressValid('1..3.4')
    }, Error);
    assert.throws(function() {
      isAddressValid('1..3.')
    }, Error);
  });
  test('Each section must be at least zero and below 256', function() {
    //Negative Numbers
    assert.throws(function() {
      isAddressValid('100.22.-11.2')
    }, Error);
    assert.throws(function() {
      isAddressValid('-1.26.2.3')
    }, Error);
    assert.throws(function() {
      isAddressValid('2.22.1.-80')
    }, Error);
    //Numbers above 255
    assert.throws(function() {
      isAddressValid('999.22.1.80')
    }, Error);
    assert.throws(function() {
      isAddressValid('1.256.1.80')
    }, Error);
    assert.throws(function() {
      isAddressValid('1.254.300.80')
    }, Error);
    assert.throws(function() {
      isAddressValid('1.254.30.800')
    }, Error);
  });
  test('Accepts valid addresses', function() {
    //All these should pass.
    assert.doesNotThrow(function() {
      isAddressValid('1.2.3.4')
    }, Error);
    assert.doesNotThrow(function() {
      isAddressValid('255.255.255.255')
    }, Error);
    assert.doesNotThrow(function() {
      isAddressValid('255.0.255.0')
    }, Error);
    assert.doesNotThrow(function() {
      isAddressValid('192.168.1.254')
    }, Error);
    assert.doesNotThrow(function() {
      isAddressValid('10.10.10.10')
    }, Error);
    assert.doesNotThrow(function() {
      isAddressValid('100.200.0.240')
    }, Error);
  });
});

//Test our methods to turn address and mask strings into binary numbers
suite('String Conversion to Binary', function() {
  test('Handle individual octets', function() {
    assert.strictEqual(octetToBinary('128'), '10000000');
    assert.strictEqual(octetToBinary('129'), '10000001');
    assert.strictEqual(octetToBinary('170'), '10101010');
    assert.strictEqual(octetToBinary('191'), '10111111');
    assert.strictEqual(octetToBinary('1'), '00000001');
    assert.strictEqual(octetToBinary('0'), '00000000');
    assert.strictEqual(octetToBinary('126'), '01111110');
  });


  test('Handle whole addresses', function() {
    assert.strictEqual(stringToBinary('128.0.0.0'), '10000000.00000000.00000000.00000000');
    assert.strictEqual(stringToBinary('0.0.0.0'), '00000000.00000000.00000000.00000000');
    assert.strictEqual(stringToBinary('0.0.0.01'), '00000000.00000000.00000000.00000001');
    assert.strictEqual(stringToBinary('128.000.00.01'), '10000000.00000000.00000000.00000001');
    assert.strictEqual(stringToBinary('192.168.1.254'), '11000000.10101000.00000001.11111110');
    assert.strictEqual(stringToBinary('10.10.10.1'), '00001010.00001010.00001010.00000001');
    assert.strictEqual(stringToBinary('255.255.255.255'), '11111111.11111111.11111111.11111111');

  });
});
