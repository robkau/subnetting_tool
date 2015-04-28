//A tool to take in an IP address and subnet mask and tell you some information.
//Can also list available subnets... complete design pending

//Code by Robert Kaulbach, project started 3/24/2015

var canvas = document.getElementById('textArea');
var ctx = canvas.getContext('2d');
fitToContainer(canvas);

function fitToContainer(canvas) {
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}


function calculateButtonValues() {
  var canvas = document.getElementById('textArea');
  var ctx = canvas.getContext('2d');



  address = document.getElementById('address').value
  mask = document.getElementById('mask').value

  try {
    var currentAddress = new Address(address, mask)
  } catch (e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    alert(e.message)
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "25px lucida";
  var items = 0

  ctx.fillText("Address: " + currentAddress.decimalAddress, 10, 50 + 25 * items);

  //ctx.fillText('Warning! This subnet mask is too short for the network,', 350, 50 + 25 * items)
  //ctx.fillText('if we care about classfull addressing.', 350, 75 + 25 * items)

  items++;
  ctx.fillText("Mask: " + currentAddress.cidrMask, 10, 50 + 25 * items);
  items++;

  ctx.fillText("This is a " + currentAddress.publicOrPrivate + ' ' + currentAddress.networkClass + ' network.', 10, 50 + 25 * items);
  items++;
  ctx.fillText("There are " + currentAddress.nshBits.subnetBits + ' subnet bits and ' + currentAddress.nshBits.hostBits + ' host bits.', 10, 50 + 25 * items);
  items++;

  ctx.fillText('This address is a ' + currentAddress.addressType + ' in the ' + currentAddress.network + currentAddress.cidrMask + ' network.', 10, 50 + 25 * items);
  items++;

  ctx.fillText('There are ' + (((Math.pow(2, parseInt(currentAddress.nshBits.hostBits)) - 2) < 0) ? '0' : ((Math.pow(2, parseInt(currentAddress.nshBits.hostBits))) - 2)) + ' possible hosts in this network.', 10, 50 + 25 * items);
  items++
  items++

  ctx.fillText('Binary form:', 10, 50 + 25 * items);
  items++
  ctx.fillText(currentAddress.binaryAddress + ' : Address', 10, 50 + 25 * items);
  items++
  ctx.fillText(currentAddress.binaryMask + ' : Mask', 10, 50 + 25 * items);
  items++



  //ctx.fillText('The networks for this subnet are: ' + currentAddress.networks, 10, 50 + 25 * items);
  //items++



}




/*
this.binaryAddress = stringToBinary(addressIn)
this.binaryMask = stringToBinary(maskIn)


this.subnetMagicNumber = getSubnetMagicNumber(this.cidrMask)
this.networks = generateSubnetIDs(this.decimalAddress, this.cidrMask)
*/
