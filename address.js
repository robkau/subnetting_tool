function Address(addressIn, maskIn) {
  //The Address object will hold all the info abput the input address

  //First step is to test the inputs and throw an error if they are not valid
  isAddressValid(addressIn);
  this.decimalAddress = addressIn
  this.binaryAddress = stringToBinary(addressIn)

  isMaskValid(addressIn, maskIn);
  this.binaryMask = stringToBinary(maskIn)
  this.cidrMask = convertDecimalMaskToCIDR(maskIn)

  this.networkClass = getNetworkInfo(this.decimalAddress, this.cidrMask).networkClass
  this.publicOrPrivate = getNetworkInfo(this.decimalAddress, this.cidrMask).publicOrPrivate
  this.nshBits = getSignificantBits(this.decimalAddress, this.cidrMask)

  this.subnetMagicNumber = getSubnetMagicNumber(this.cidrMask)
  this.networks = generateSubnetIDs(this.decimalAddress, this.cidrMask)
  this.network = getSubnetOfAddress(this.decimalAddress, this.cidrMask).network
  this.addressType = getSubnetOfAddress(this.decimalAddress, this.cidrMask).addressType
}

function getSubnetOfAddress(addressIn, maskIn) {
  var newMaskIn = maskIn.slice(1);
  var octet = Math.ceil(newMaskIn / 8)
  var toReturn = {
    network: '',
    addressType: ''
  }
  var arrayHolder = [0, 0, 0, 0]
  for (var i = 1; i <= 4; i++) {
    //Loop over each octet, save the octets that will not be changed or checked, zero out the rest
    if (i < octet)
      arrayHolder[i - 1] = getOctetValue(addressIn, i);
  }
  var thisNetwork;
  var nextNetwork;
  for (var i = 0; i <= 256 / getSubnetMagicNumber(maskIn); i++) {
    if (getOctetValue(addressIn, octet) < i * getSubnetMagicNumber(maskIn)) {
      //console.log(getOctetValue(addressIn, octet) + 'was greater than ' + i * getSubnetMagicNumber(maskIn))
      thisNetwork = (i - 1) * getSubnetMagicNumber(maskIn)
      nextNetwork = (i) * getSubnetMagicNumber(maskIn)
      break;
    }
  }
  arrayHolder[octet - 1] = thisNetwork

  var stringToReturn = '';
  for (var i = 0; i < 4; i++)
    stringToReturn += arrayHolder[i] + '.'
  toReturn.network = stringToReturn.substring(0, stringToReturn.length - 1)

  //Now figure out if it's a host, network ID, or broadcast address
  if (addressIn == toReturn.network)
    toReturn.addressType = 'Network ID'
  else {
    for (var i = 4; i >= octet; i--) {
      if (i != octet)
        if (getOctetValue(addressIn, i) != '255') {
          toReturn.addressType = 'Host'
          break
        }
      if (i = octet)
        if (getOctetValue(addressIn, i) != nextNetwork - 1) {
          toReturn.addressType = 'Host'
          break
        }
    }
    if (toReturn.addressType === '')
      toReturn.addressType = 'Broadcast Address'
  }
  return toReturn;

}

function generateSubnetIDs(addressIn, maskIn) {
  //Figure out which octet we are modifying based off the mask
  networks = []

  var octet = Math.ceil(maskIn.slice(1) / 8);
  var magicNumber = getSubnetMagicNumber(maskIn);
  //First loop saves the octets that will remain unchanged, and zeroes out all the others
  var arrayHolder = [0, 0, 0, 0]
  for (var i = 1; i <= 4; i++) {
    //Loop over each octet
    if (i < octet)
      arrayHolder[i - 1] = getOctetValue(addressIn, i);
  }

  //Now we repeatedly add the subnet values to the networks binding, changing only the significant octet
  var networkID = 0;

  while (networkID < 256) {
    var stringToReturn = ''
    arrayHolder[octet - 1] = networkID;
    for (var i = 0; i < 4; i++) {
      stringToReturn += arrayHolder[i] + '.'
    }
    networks.push(stringToReturn.substring(0, stringToReturn.length - 1));
    networkID += magicNumber;
  }
  return networks;
}


function stringToBinary(stringIn) {
  //Takes in FOUR octets separated by periods and returns the binary representation.
  if (stringIn[0] === '/')
    stringIn = convertCIDRMaskToDecimal(stringIn);
  tempString = ""
  for (var i = 1; i <= 4; i++)
    tempString += octetToBinary(getOctetValue(stringIn, i)) + "."
  return tempString.substring(0, tempString.length - 1)
}


function octetToBinary(stringIn) {
  //Takes in decimal number between 0 and 255. Returns an 8 character string representation in binary.
  tempArray = [0, 0, 0, 0, 0, 0, 0, 0]
  for (var i = 7; i >= 0; i--) {
    if (parseInt(stringIn) >= Math.pow(2, i)) {
      tempArray[7 - i] = 1
      stringIn -= Math.pow(2, i)
    }
  }
  return tempArray.join('')
}


function getSubnetMagicNumber(maskIn) {
  if (maskIn[0] != '/')
    maskIn = convertDecimalMaskToCIDR(maskIn);
  maskIn = maskIn.slice(1);
  if (maskIn % 8 === 0)
    return 1
  return Math.pow(2, 8 - (maskIn % 8))
}

function getSignificantBits(addressIn, maskIn) {
  var toReturn = {
    networkBits: 'n/a',
    subnetBits: 'n/a',
    hostBits: 'n/a'
  }

  /*  if (getNetworkInfo(addressIn, maskIn).networkClass === 'Class A')
      toReturn.networkBits = 8;
    if (getNetworkInfo(addressIn, maskIn).networkClass === 'Class B')
      toReturn.networkBits = 16;
    if (getNetworkInfo(addressIn, maskIn).networkClass === 'Class C')
      toReturn.networkBits = 24;*/




  newMaskIn = parseInt(maskIn.slice(1));
  toReturn.subnetBits = newMaskIn;
  toReturn.hostBits = 32 - toReturn.subnetBits;
  return toReturn;
}

function getNetworkInfo(addressIn, maskIn) {
  maskIn = parseInt(maskIn.slice(1));
  //returns JSON or object with a few mappings. Class, Pub/Priv.
  var toReturn = {
    networkClass: 'Error',

    publicOrPrivate: 'Public'
  }

  if (getOctetValue(addressIn, 1) < 127 && getOctetValue(addressIn, 1) > 0) {
    toReturn.networkClass = 'Class A';
  }
  if (getOctetValue(addressIn, 1) === 127) {
    toReturn.networkClass = 'Loopback and Diagnostic Class';
    toReturn.publicOrPrivate = 'Special'
  }
  if (getOctetValue(addressIn, 1) < 192 && getOctetValue(addressIn, 1) > 127) {
    toReturn.networkClass = 'Class B';
  }
  if (getOctetValue(addressIn, 1) < 224 && getOctetValue(addressIn, 1) > 191) {
    toReturn.networkClass = 'Class C';
  }
  if (getOctetValue(addressIn, 1) < 240 && getOctetValue(addressIn, 1) > 223) {
    toReturn.networkClass = 'Class D';
  }
  if (getOctetValue(addressIn, 1) < 256 && getOctetValue(addressIn, 1) > 239) {
    toReturn.networkClass = 'Class E';
  }

  if (getOctetValue(addressIn, 1) == 10 && maskIn == 8)
    toReturn.publicOrPrivate = "Private"
  if (getOctetValue(addressIn, 1) == 172 && getOctetValue(addressIn, 2) > 15 && getOctetValue(addressIn, 2) < 32 && maskIn == 12)
    toReturn.publicOrPrivate = "Private"
  if (getOctetValue(addressIn, 1) == 192 && getOctetValue(addressIn, 2) == 168 && maskIn == 16)
    toReturn.publicOrPrivate = "Private"

  return toReturn;
}

function convertDecimalMaskToCIDR(maskIn) {
  if (maskIn[0] === '/')
    return maskIn
  var cidrCounter = 0

  for (var p = 1; p <= 4; p++) {
    var octetValue = getOctetValue(maskIn, p)
    for (var z = 7; z >= 0; z--)
      if (octetValue >= Math.pow(2, z)) {
        cidrCounter++
        octetValue -= Math.pow(2, z)
      }
  }

  return '/' + cidrCounter;

}

function convertCIDRMaskToDecimal(maskIn) {

  newMaskIn = maskIn.slice(1)
  if (parseInt(newMaskIn) < 0 || parseInt(newMaskIn) > 32)
    throw new Error("If you give the mask in CIDR notation it must be between 0 and 32")

  maskIn = convertMaskToBinary(maskIn);
  var stringToReturn = '';

  for (var i = 1; i <= 4; i++) {
    var binaryOctet = getOctetValue(maskIn, i).toString();
    var octetValue = 0;
    for (var t = 0; t < 8; t++) {
      if (binaryOctet[t] === '1')
        octetValue += Math.pow(2, 7 - t);
    }
    stringToReturn += octetValue + '.'
  }
  return stringToReturn.substring(0, stringToReturn.length - 1)



  return stringToReturn.substring(0, stringToReturn.length - 1)

}



function convertMaskToBinary(maskIn) {

  if (maskIn[0] === '/') { //They gave it in CIDR notation
    maskIn = maskIn.slice(1)
    var binaryArray = [
      [0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 0, 0, 0]
    ]
    for (var j = 0; j < 32; j++)
      if (maskIn > 0) {
        binaryArray[j] = '1'
        maskIn--;
      } else
        binaryArray[j] = '0';

    stringToReturn = '';
    arrayString = binaryArray.join('');
    for (var i = 0; i < 4; i++)
      stringToReturn += arrayString.substring(i * 8, (i + 1) * 8) + '.'
    return stringToReturn.substring(0, stringToReturn.length - 1)
  } else
    return stringToBinary(maskIn)
}



function isMaskValid(addressIn, maskIn) {

  //Make sure mask is in DECIMAL format for processing
  if (maskIn[0] == '/') {
    if (!/^\/\d+$/.test(maskIn))
      throw new Error("Mask must contain only digits");
    maskIn = convertCIDRMaskToDecimal(maskIn);

  }


  try {
    isAddressValid(maskIn)
  } catch (e) {
    //Same checks as addresses, but we allow the first octet to be zero this time
    if (e.message !== "First section of address cannot be zero.")
      throw e;
  }




  //Convert to Binary now
  var binaryMaskIn = convertMaskToBinary(maskIn);

  //Make sure mask is not too short for the network class



  //Make sure the mask is sequential ones and the rest zeros
  if (!/^(1|\.)*(0|\.)*$/.test(binaryMaskIn))
    throw new Error(
      "Invalid Mask detected. The binary representation must be sequential ones and the rest zeros");





}

function isAddressValid(addressIn) {
  //Has to have 4 sections separated by periods
  //Each section has to have 1 through 3 digits
  if (!/^(\d{1,3})(\.\d{1,3}){3}$/.test(addressIn))
    throw new Error(
      "Invalid Address detected. Must have 4 sections, separated by periods, with 1 to 3 digits in each. Binary input addresses currently not supported.");

  //First section cannot be zero
  if (getOctetValue(addressIn, 1) === 0)
    throw new Error("First section of address cannot be zero.")

  //Every section must be above 0 and below 256
  for (var i = 1; i <= 4; i++)
    if (getOctetValue(addressIn, i) < 0 || getOctetValue(addressIn, i) > 255)
      throw new Error("Address sections must be between 0 and 255.")
}


function getOctetValue(addressIn, octetNumber) {

  //Returns the 1st, 2nd, 3rd, or 4th octet value as an integer. AddressIn is a string.
  if (octetNumber < 1)
    throw new Error("Wrong value in getOctetValue call");
  if (octetNumber === 1)
    if (addressIn.indexOf('.') != -1)
      return parseInt(addressIn.substring(0, addressIn.indexOf('.')));
    else return parseInt(addressIn);
  return getOctetValue(addressIn.substring(addressIn.indexOf('.') + 1), octetNumber - 1);

}





exports.Address = Address;
exports.isAddressValid = isAddressValid;
exports.isMaskValid = isMaskValid;
exports.octetToBinary = octetToBinary;
exports.stringToBinary = stringToBinary;
exports.isMaskValid = isMaskValid;
exports.convertMaskToBinary = convertMaskToBinary;
exports.convertDecimalMaskToCIDR = convertDecimalMaskToCIDR;
exports.convertCIDRMaskToDecimal = convertCIDRMaskToDecimal;
exports.getOctetValue = getOctetValue;
exports.getNetworkInfo = getNetworkInfo;
exports.getSignificantBits = getSignificantBits;
exports.Address = Address;
exports.getSubnetMagicNumber = getSubnetMagicNumber;
exports.generateSubnetIDs = generateSubnetIDs;
exports.getSubnetOfAddress = getSubnetOfAddress;
