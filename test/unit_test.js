var chai = require('chai'),
  assert = chai.assert,
  Address = require('./../address').Address,
  isAddressValid = require('./../address').isAddressValid,
  isMaskValid = require('./../address').isMaskValid,
  octetToBinary = require('./../address').octetToBinary,
  stringToBinary = require('./../address').stringToBinary,
  convertToCIDR = require('./../address').convertToCIDR,
  convertMaskToBinary = require('./../address').convertMaskToBinary,
  convertDecimalMaskToCIDR = require('./../address').convertDecimalMaskToCIDR,
  convertCIDRMaskToDecimal = require('./../address').convertCIDRMaskToDecimal,
  getOctetValue = require('./../address').getOctetValue;


//Figure out why the octet value function isn't working anmore
suite('Why isnt Octet Value working anymore', function() {
  test('See what it returns', function() {
    assert.strictEqual(getOctetValue('1.2.3.4', 1), 1);
    assert.strictEqual(getOctetValue('1.2.3.4', 2), 2);
    assert.strictEqual(getOctetValue('1.2.3.4', 3), 3);
    assert.strictEqual(getOctetValue('1.2.3.4', 4), 4);
    assert.strictEqual(getOctetValue('100.200.300.400', 1), 100);
    assert.strictEqual(getOctetValue('100.200.300.400', 2), 200);
    assert.strictEqual(getOctetValue('100.200.300.400', 3), 300);
    assert.strictEqual(getOctetValue('100.200.300.400', 4), 400);

    assert.strictEqual(getOctetValue('11111111.11111111.11110000.00000000', 1), 11111111);
    assert.strictEqual(getOctetValue('11111111.11111111.11110000.00000000', 2), 11111111);
    assert.strictEqual(getOctetValue('11111111.11111111.11110000.00000000', 3), 11110000);
    assert.strictEqual(getOctetValue('11111111.11111111.11110000.00000000', 4), 00000000);




  })




});

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
    assert.strictEqual(octetToBinary('255'), '11111111');
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

suite('Subnet Mask Validation and Transformation', function() {
  test('Has to have 4 sections separated by periods', function() {
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.255.255')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.255.255.')
    });
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.255.255.255.')
    });
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.255.255.255.255.')
    });
  });
  test('First section can be zero', function() {
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '0.0.0.0')
    }, Error);
  });
  test('Each section has 1 to 3 digits', function() {
    //Too many digits
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.0000.0.0')
    }, Error);
    //Not enough digits
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255..0.0')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '192.0.0.')
    }, Error);
  });
  test('Each section must be at least zero and below 256 and CIDR between 0 and 32', function() {
    //Negative Numbers
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.255.-3.0')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.0.0.-1')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.-1.-1.-1')
    }, Error);
    //Numbers above 255
    assert.throws(function() {
      isMaskValid('192.0.0.0', '999.255.0.0')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '/-2')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '/33')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '/35')
    }, Error);
  });
  test('Does not accept masks that are non-sequential binary', function() {
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.0.255.255')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.0.255.0')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.129.0.0')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '199.0.0.0')
    }, Error);
    assert.throws(function() {
      isMaskValid('192.0.0.0', '255.255.255.253')
    }, Error);


  });
  test('Accepts valid masks', function() {
    //All these should pass.
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '255.255.255.224')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '255.255.255.255')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '255.192.0.0')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/0')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/1')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/12')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/27')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/12')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/32')
    }, Error);


  });



  test('Can convert CIDR mask to binary notation', function() {
    assert.strictEqual(convertMaskToBinary('/0'), '00000000.00000000.00000000.00000000');
    assert.strictEqual(convertMaskToBinary('/7'), '11111110.00000000.00000000.00000000');
    assert.strictEqual(convertMaskToBinary('/8'), '11111111.00000000.00000000.00000000');
    assert.strictEqual(convertMaskToBinary('/9'), '11111111.10000000.00000000.00000000');
    assert.strictEqual(convertMaskToBinary('/15'), '11111111.11111110.00000000.00000000');
    assert.strictEqual(convertMaskToBinary('/16'), '11111111.11111111.00000000.00000000');
    assert.strictEqual(convertMaskToBinary('/17'), '11111111.11111111.10000000.00000000');
    assert.strictEqual(convertMaskToBinary('/24'), '11111111.11111111.11111111.00000000');
    assert.strictEqual(convertMaskToBinary('/25'), '11111111.11111111.11111111.10000000');
    assert.strictEqual(convertMaskToBinary('/31'), '11111111.11111111.11111111.11111110');
    assert.strictEqual(convertMaskToBinary('/32'), '11111111.11111111.11111111.11111111');
  });

  test('Can convert decimal mask to CIDR notation', function() {
    assert.strictEqual(convertDecimalMaskToCIDR('255.255.255.0'), '/24');
    assert.strictEqual(convertDecimalMaskToCIDR('128.0.0.0'), '/1');
    assert.strictEqual(convertDecimalMaskToCIDR('255.255.255.255'), '/32');
    assert.strictEqual(convertDecimalMaskToCIDR('255.255.192.0'), '/18');
    assert.strictEqual(convertDecimalMaskToCIDR('0.0.0.0'), '/0');

  });

  test('Can convert CIDR mask to decimal notation', function() {

    assert.strictEqual(convertCIDRMaskToDecimal('/1'), '128.0.0.0');
    assert.strictEqual(convertCIDRMaskToDecimal('/24'), '255.255.255.0');
    assert.strictEqual(convertCIDRMaskToDecimal('/32'), '255.255.255.255');
    assert.strictEqual(convertCIDRMaskToDecimal('/18'), '255.255.192.0');
    assert.strictEqual(convertCIDRMaskToDecimal('/0'), '0.0.0.0');


  });

  test('Can convert binary mask to CIDR notation', function() {



  });









});
