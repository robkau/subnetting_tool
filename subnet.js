//A tool to take in an IP address and subnet mask and tell you some information.
//Can also list available subnets... complete design pending

//Code by Robert Kaulbach, project started 3/24/2015


var canvas = document.getElementById('textArea');
var ctx = canvas.getContext('2d');


function calculateButtonValues() {
  address = document.getElementById('address').value
  mask = document.getElementById('mask').value

  try {
    currentAddress = new Address(address, mask)
  } catch (e) {

  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "25px serif";
  ctx.fillText("Address: " + address, 10, 50);
  ctx.fillText("Mask: /" + cidrCounter, 10, 75);
  ctx.fillText("This is a Class " + calcNetwork(address, cidrCounter)[0] + " " + calcNetwork(address, cidrCounter)[1] + " address.", 10, 100)
  ctx.fillText("Binary address is: " + binaryAddress, 10, 125);
  ctx.fillText("Binary mask is: " + maskToBinary(mask), 10, 150)





  //print all red network bits
  ctx.fillStyle = "#ff0000";
  var tostring = []
  var totalWidthOne = 0
  var totalWidthTwo = 0
  for (i = 0; i < nshBits[0]; i++) {
    if (binaryAddress[i] == '.') {
      nshBits[0]++
    } else {
      tostring[i] = binaryAddress[i]
    }
  }
  ctx.fillText(tostring, 10, 200)
  totalWidthOne = ctx.measureText(tostring).width
  tostring = []
    //print all green subnet bits on same line
  ctx.fillStyle = "#00ff00";

  for (i = 0; i < nshBits[1]; i++) {
    if (binaryAddress[i] == '.') {
      nshBits[1]++
    } else {
      tostring[i] = binaryAddress[i + nshBits[0]]
    }
  }
  ctx.fillText(tostring, totalWidthOne + 10, 200)
  totalWidthTwo = ctx.measureText(tostring).width
  tostring = []
    //print all blue host bits on same line
  ctx.fillStyle = "#0000ff";

  for (i = 0; i < nshBits[2]; i++) {
    if (binaryAddress[i] == '.') {
      nshBits[2]++
    } else {
      tostring[i] = binaryAddress[i + nshBits[0] + nshBits[1]]
    }
  }
  ctx.fillText(tostring, totalWidthOne + totalWidthTwo + 10, 200)

  ctx.fillStyle = "#ff0000";
  ctx.fillText(nshBits[0] + " network bits", 10, 225)
  ctx.fillStyle = "#00ff00";
  ctx.fillText(nshBits[1] + " subnet bits", 10 + (totalWidthOne * 1.5), 225)
  ctx.fillStyle = "#0000ff";
  ctx.fillText(nshBits[2] + " host bits", 10 + totalWidthOne + totalWidthTwo + ctx.measureText(tostring).width * .5, 225)
    //    ctx.fillText("There are " + dotdotdot + " subnets",10,250)
    //    ctx.fillText("Each subnet has " + dotdotdot + "hosts",10,275)
}



function Address(addressIn, maskIn) {
  this.binaryAddress = addressToBinary(addressIn)
  this.binaryMask = maskToBinary(maskIn)

  info = getNetworkInfo(this.binaryAddress, this.binaryMask)
  this.class = info.class
  this.pubOrPriv = info.pubOrPriv
  this.nshBits = info.nshBits
}




}
