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
  getOctetValue = require('./../address').getOctetValue,
  getNetworkInfo = require('./../address').getNetworkInfo,
  getSignificantBits = require('./../address').getSignificantBits,
  getSubnetMagicNumber = require('./../address').getSubnetMagicNumber,
  Address = require('./../address').Address;


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
      isMaskValid('0.0.0.0', '0.0.0.0')
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
      isMaskValid('192.0.0.0', '255.255.255.0')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/24')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/25')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/26')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/27')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/28')
    }, Error);
    assert.doesNotThrow(function() {
      isMaskValid('192.0.0.0', '/32')
    }, Error);
  });
  /* This test no longer applies as we assume everything is CIDR, and classful neworking is not in use
  test('Does not accept masks too short for the network', function() {
     assert.throws(function() {
       isMaskValid('10.0.0.0', '/2')
     }, Error);
   });*/

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
});
suite('Can calculate network info from an address and mask', function() {
  test('Determine class of networks', function() {
    assert.strictEqual(getNetworkInfo('10.0.0.0', '/15').networkClass, 'Class A')
    assert.strictEqual(getNetworkInfo('127.0.0.0', '/15').networkClass, 'Loopback and Diagnostic Class')
    assert.strictEqual(getNetworkInfo('129.0.0.0', '/15').networkClass, 'Class B')
    assert.strictEqual(getNetworkInfo('222.0.0.0', '/15').networkClass, 'Class C')
    assert.strictEqual(getNetworkInfo('225.0.0.0', '/15').networkClass, 'Class D')
    assert.strictEqual(getNetworkInfo('254.0.0.0', '/15').networkClass, 'Class E')
  });
  test('Determine public or private network', function() {
    assert.strictEqual(getNetworkInfo('10.0.0.0', '/15').publicOrPrivate, 'Public')
    assert.strictEqual(getNetworkInfo('155.0.2.0', '/12').publicOrPrivate, 'Public')
    assert.strictEqual(getNetworkInfo('127.0.0.0', '/15').publicOrPrivate, 'Special')
    assert.strictEqual(getNetworkInfo('10.0.0.0', '/8').publicOrPrivate, 'Private')
    assert.strictEqual(getNetworkInfo('172.17.0.0', '/12').publicOrPrivate, 'Private')
    assert.strictEqual(getNetworkInfo('192.168.0.0', '/16').publicOrPrivate, 'Private')
  });
});
suite('Can calculate significant bits', function() {
  test('Class A networks', function() {
    //assert.strictEqual(getSignificantBits('10.0.0.0', '/15').networkBits, 8)
    assert.strictEqual(getSignificantBits('10.0.0.0', '/15').subnetBits, 15)
    assert.strictEqual(getSignificantBits('10.0.0.0', '/15').hostBits, 17)
  });
  test('Class B networks', function() {
    //assert.strictEqual(getSignificantBits('144.12.0.0', '/18').networkBits, 16)
    assert.strictEqual(getSignificantBits('144.12.0.0', '/18').subnetBits, 18)
    assert.strictEqual(getSignificantBits('144.12.0.0', '/18').hostBits, 14)
  });
  test('Class C networks', function() {
    //assert.strictEqual(getSignificantBits('192.168.0.1', '/29').networkBits, 24)
    assert.strictEqual(getSignificantBits('192.168.0.1', '/29').subnetBits, 29)
    assert.strictEqual(getSignificantBits('192.168.0.1', '/29').hostBits, 3)
  });
  test('Magic Number from CIDR', function() {
    assert.strictEqual(getSubnetMagicNumber('/5'), 8);
    assert.strictEqual(getSubnetMagicNumber('/31'), 2);
    assert.strictEqual(getSubnetMagicNumber('/30'), 4);
    assert.strictEqual(getSubnetMagicNumber('/24'), 1);
    assert.strictEqual(getSubnetMagicNumber('/23'), 2);
  })
  test('Magic Number from Decimal', function() {
    assert.strictEqual(getSubnetMagicNumber('248.0.0.0'), 8);
    assert.strictEqual(getSubnetMagicNumber('255.255.255.254'), 2);
    assert.strictEqual(getSubnetMagicNumber('255.255.255.252'), 4);
    assert.strictEqual(getSubnetMagicNumber('255.255.255.0'), 1);
    assert.strictEqual(getSubnetMagicNumber('255.255.254.0'), 2);
  })
});
suite('Can construct the address and have all properties auto-calculate', function() {
  test('Make a new address', function() {
    var newAddress = new Address('192.168.1.254', '/16')
    assert.strictEqual(newAddress.decimalAddress, '192.168.1.254');
    assert.strictEqual(newAddress.binaryAddress, '11000000.10101000.00000001.11111110');
    assert.strictEqual(newAddress.binaryMask, '11111111.11111111.00000000.00000000');
    assert.strictEqual(newAddress.cidrMask, '/16');
    assert.strictEqual(newAddress.networkClass, 'Class C');
    assert.strictEqual(newAddress.publicOrPrivate, 'Private');
    //assert.strictEqual(newAddress.nshBits.networkBits, 24);
    assert.strictEqual(newAddress.nshBits.subnetBits, 16);
    assert.strictEqual(newAddress.nshBits.hostBits, 16);
  });
});
