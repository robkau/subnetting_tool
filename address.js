function Address(addressIn, maskIn) {
  //The Address object will hold all the info abput the input address

  //First step is to test the inputs and throw an error if they are not valid
  isAddressValid(addressIn);
  this.decimalAddress = addressIn
  this.binaryAddress = stringToBinary(addressIn)

  isMaskValid(addressIn, maskIn);
  this.binaryMask = stringToBinary(maskIn)
  this.cidrMask = convertToCIDR(maskIn)

  info = getNetworkInfo(this.binaryAddress, this.binaryMask)
  this.networkClass = info.networkClass
  this.publicOrPrivate = info.publicOrPrivate



  this.nshBits = info.nshBits
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

function stringToBinary(stringIn) {
  //Takes in FOUR octets separated by periods and returns the binary representation.
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

function getOctetValue(addressIn, octetNumber) {

  //Returns the 1st, 2nd, 3rd, or 4th octet value as an integer. AddressIn is a string.
  if (octetNumber === 1)
    if (addressIn.indexOf('.') != -1)
      return parseInt(addressIn.substring(0, addressIn.indexOf('.')));
    else return addressIn;
  return getOctetValue(addressIn.substring(addressIn.indexOf('.') + 1), octetNumber - 1);

}


function isMaskValid(maskIn) {
  //Similar 
  //Has to have 4 sections separated by periods
  //Each section has to have 1 through 3 digits
  if (!/^(\d{1,3})(\.\d{1,3}){3}$/.test(addressIn))
    throw new Error(
      "Invalid Address detected. Must have 4 sections, separated by periods, with 1 to 3 digits in each. Binary input addresses currently not supported.");

  //First section cannot be zero
  if (getOctetValue(addressIn, 1) === 0)
    throw new Error("First section of address cannot be zero.")

  //Every section must be above 0 and below 256
  for (i = 1; i <= 4; i++)
    if (getOctetValue(addressIn, i) < 0 || getOctetValue(addressIn, i) > 255)
      throw new Error("Address sections must be between 0 and 255.")
}

function isMaskValid(addressIn, maskIn) {

  //ADD CHECKS FOR MASKS TOO SHORT (Class B network wih a mask of /4 for example)

  //Which form is it?
  if (maskIn[0] === '/') {
    //It's CIDR notation or invalid
    maskIn = maskIn.slice(1)
    if (!/^\d+$/.test(maskIn)) {
      throwError("Mask must consist of digits from 0-9")
      return false
    }
    if (maskIn < 0) {
      throwError("Mask must be at least 0")
      return false
    }
    if (maskIn > 32) {
      throwError("Mask must be at most 32")
      return false
    }
    //Any other cases to break?
    cidrCounter = maskIn

    //Check CIDRcounter not less than network bits
    if (cidrCounter < getSignificantBits(addressIn, maskIn)[0]) {
      throwError("Subnet mask too short for this network.")
      return false
    }
  } else {
    //It's long notation or invalid
    //Check that it's not invalid using previous method.
    //Same checks except we now allow the first octet to be zero.
    if (!isAddressValid(maskIn, false)) {
      return false
    } else {
      //Step through each octet and see how many bits it contributes
      //A few more checks... can't have 255.0.255.0 or anything
      var maskSplit = maskIn.split('.')
      cidrCounter = 0
      var endOfDigits = false
      for (i = 0; i < 4; i++) {

        maskSplit[i] = parseInt(maskSplit[i])
        if (endOfDigits && maskSplit[i] !== 0) {
          throwError("Invalid subnet address detected via non-sequental binary ones")
          return false
        }


        if (maskSplit[i] === 0 && i !== 0) {
          endOfDigits = true
        }
        for (j = 7; j >= 0; j--) {
          if (maskSplit[i] >= Math.pow(2, j)) {
            //confirm("subtracting" + Math.pow(2,j) + " from " +maskSplit[i])
            maskSplit[i] = maskSplit[i] - Math.pow(2, j)
            cidrCounter++
          } else {
            if (maskSplit[i] != 0) {
              throwError("Invalid subnet address detected via non-sequental binary ones")
              return false
            }
            break
          }
        }

      }
      //Check CIDRcounter not less than network bits
      if (cidrCounter < getSignificantBits(addressIn, maskIn)[0]) {
        throwError("Subnet mask too short for this network.")
        return false
      }


    }

  }
  return true
}









function addressToBinary(addressIn) {

  //First we make sure that this address is valid
  //This function throws an error if the address is not valid
  isAddressValid(addressIn)

  //Now we break down the decimal numbers to binary
  var binaryArray = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ]
  var addressSplit = addressIn.split('.')

  for (j = 0; j < 4; j++) {
    for (i = 7; i >= 0; i--) {
      if (parseInt(addressSplit[j]) >= Math.pow(2, i)) {
        binaryArray[j][7 - i] = 1
        addressSplit[j] -= Math.pow(2, i)
      }
    }
  }
  var binaryString = ""
  for (j = 0; j < 4; j++) {
    for (i = 0; i < 8; i++) {
      binaryString += binaryArray[j][i]
    }
    if (j != 3) {
      binaryString += "."
    }
  }

  return binaryString
}

function maskToBinary(maskIn) {

}


//A somewhat monolithic function that returns an object holding several values that give info about the network
function getNetworkInfo(addressIn, maskIn) {
  maskIn = convertMaskToBinary(maskIn)


}


function getSignificantBits(addressIn, maskIn) {
  //Return length 3 array. El 0 = network bits, el 1 = subnet bits, el 2 = host bits
  var bitsToReturn = [-1, -1, -1]
    //Network Bits
  if (calcNetwork(addressIn, maskIn)[0] === "A") {
    bitsToReturn[0] = 8
  } else {
    if (calcNetwork(addressIn, maskIn[0] === "B")) {
      bitsToReturn[0] = 16
    } else {
      if (calcNetwork(addressIn, maskIn[0]) === "C") {
        bitsToReturn[0] = 24
      } else {
        bitsToReturn[0] = -1
      }
    }
  }

  //Subnet Bits
  bitsToReturn[1] = cidrCounter - bitsToReturn[0]

  //Host Bits
  bitsToReturn[2] = 32 - cidrCounter


  return bitsToReturn
}







function calcNetwork(addressIn, maskIn) {
  addressSplit = addressIn.split('.')
  for (i = 0; i < 4; i++) {
    addressSplit[i] = parseInt(addressSplit[i])
  }
  if (addressSplit[0] < 127) {
    if (addressSplit[0] === 10 && maskIn >= 8) {
      //Private A
      return ["A", "Private"]

    } else {
      //Public A
      return ["A", "Public"]
    }
  } else {
    if (addressSplit[0] === 127) {
      //Loopback
      return ["Loopback", "Reserved"]
    } else {
      if (addressSplit[0] < 192) {

        if (addressSplit[0] === 172 && addressSplit[1] > 15 && addressSplit[1] < 33 && maskIn >= 12) {
          //Private B
          return ["B", "Private"]

        } else {
          //Public B
          return ["B", "Public"]
        }
      } else {
        if (addressSplit[0] < 224) {
          //Class C
          if (addressSplit[0] === 192 && addressSplit[1] === 168 && maskIn >= 16) {
            //Private C
            return ["C", "Private"]
          } else {
            //Public C
            return ["C", "Public"]
          }
        } else {
          if (addressSplit[0] < 240) {
            //Class D
            return ["D", "Multicast"]
          } else {
            if (addressSplit[0] < 256) {
              //Class E
              return ["E", "Experimental"]
            } else {
              //Error, Unknown network
              throwError("Unknown error, could not calculate network type.")
              return 0
            }
          }
        }
      }
    }
  }


}

function maskToBinary(maskIn) {
  if (maskIn[0] === '/') {
    maskIn = maskIn.slice(1)
    var binaryArray = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
    for (j = 0; j < 4; j++) {
      for (i = 0; i <= 7; i++) {
        if (maskIn > 0) {
          binaryArray[j][i] = 1
          maskIn--
        }
      }
    }
    var binaryString = ""
    for (j = 0; j < 4; j++) {
      for (i = 0; i < 8; i++) {
        binaryString += binaryArray[j][i]
      }
      if (j != 3) {
        binaryString += "."
      }
    }
    return binaryString
  } else
    return addressToBinary(maskIn)
}


exports.Address = Address;
exports.isAddressValid = isAddressValid;
exports.isMaskValid = isMaskValid;
exports.octetToBinary = octetToBinary;
exports.stringToBinary = stringToBinary;
//exports.convertToCIDR = convertToCIDR;
//exports.getNetworkInfo = getNetworkInfo;
