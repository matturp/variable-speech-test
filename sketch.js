
// ARDUINO

let serial; // variable for the serial object
let latestData = "waiting for data"; // variable to hold the data

// SPEECH TO TEXT

const NUMBER_OF_FONTS = 5;

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.variable');


// COLOURS

let paletteA = ["#002626","#0e4749","#95c623","#e55812","#efe7da","#93b7be","#f1fffa","#785964","#fcfcfc", "#f1fffa"];
let paletteB = ["#001219","#005f73","#0a9396","#94d2bd","#e9d8a6","#ee9b00","#ca6702","#bb3e03","#ae2012","#9b2226"];
let paletteC = ["#ffe8d6","#829e95","#f1f1f1","#ff7f11","#ffffff","#829e95","#022b3a","#ffe8d6","#fAf5f0","#1c1c1c"];
let paletteD = ["#ffcdb2","#ffb4a2","#e5989b","#b5838d","#6d6875","#ffcdb2","#ffb4a2","#e5989b","#b5838d","#6d6875"];
let paletteE = ["#fbf8cc","#fde4cf","#ffcfd2","#f1c0e8","#cfbaf0","#a3c4f3","#90dbf4","#8eecf5","#98f5e1","#b9fbc0"];
let paletteF = ["#f8f9fa","#e9ecef","#dee2e6","#ced4da","#adb5bd","#6c757d","#495057","#343a40","#212529", "#FEEBF4"];

let palette = paletteC; // CHANGE PALETTE LETTER A - F TO VARY PALETTES
let sensitivity = 1; // RANGE 0 - 1


let index = Math.random();
index *= palette.length;
index = Math.floor(index);

var textColor = document.getElementById("words");
words.style.color = (palette[index]);
document.body.style.backgroundColor = (palette[index -1]);

// MIC INPUT

let mic, fft;
let voiceWeight;


// SETUP ---------------------------------------------------------------------------------

function setup() {
  //noCanvas();

  createCanvas(windowWidth, 500);
  //background(0);

  mic = new p5.AudioIn();
  fft = new p5.FFT(0.9,512);
  //mic.start();
  fft.setInput(mic);
  
  variable = select('.variable');

  // ARDUINO

  // serial constructor
  serial = new p5.SerialPort();
  // get a list of all connected serial devices
  serial.list();
  // serial port to use - you'll need to change this
  serial.open('/dev/tty.usbmodem14201');
  // callback for when the sketchs connects to the server
  serial.on('connected', serverConnected);
  // callback to print the list of serial devices
  serial.on('list', gotList);
  // what to do when we get serial data
  serial.on('data', gotData);
  // what to do when there's an error
  serial.on('error', gotError);
  // when to do when the serial port opens
  serial.on('open', gotOpen);
  // what to do when the port closes
  serial.on('close', gotClose);
}

// ARDUINO

function serverConnected() {
  console.log("Connected to Server");
}

// list the ports
function gotList(thelist) {
  console.log("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    console.log(i + " " + thelist[i]);
  }
}

function gotOpen() {
  console.log("Serial Port is Open");
}

function gotClose() {
  console.log("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  console.log(theerror);
}

// when data is received in the serial buffer

function gotData() {
  let currentString = serial.readLine(); // store the data in a variable
  trim(currentString); // get rid of whitespace
  if (!currentString) return; // if there's nothing in there, ignore it
  //console.log(currentString); // print it out
  latestData = currentString; // save it to the global variable

}

// SPEECH INPUT

let recognitionBusy = false;

function startRecognition() {
  if (recognitionBusy) return;

  recognition.start();
  //mic.start();
  console.log('Ready to receive a color command.');

  recognitionBusy = true;
}

document.body.onkeydown = function() {
  mic.start();
}

let font = 0;

// SPEECH RESULT

recognition.onresult = function(event) {

  var words = event.results[0][0].transcript;
  diagnostic.textContent = words;
  console.log('Confidence: ' + event.results[0][0].confidence);  

  // RANDOMISE FONTS

  document.body.className = random(['font-0','font-1','font-2','font-3','font-4']);
  
  // DISPLAY FONTS IN SEQUENCE

  //document.body.className = `font-${font}`;
  // font++;
  // font = font % 5;

  recognitionBusy = false;
}


// DRAW ---------------------------------------------------------------------------------

function draw() {

  //background((palette[index -1]));
  //background('red');
  clear();

  // TEXT VARIABLE STYLING

  let spectrum = fft.analyze();
  //console.log('Spectrum ' + spectrum.length);

  let lowMid = fft.getEnergy("lowMid");
  let mid = fft.getEnergy("mid");
  let highMid = fft.getEnergy("highMid");
  let treble = fft.getEnergy("treble");
  //console.log(treble);


  voiceWeight = map(lowMid, 0, 200, 0, 1000);
  voiceInvWeight = map(treble, 0, 20, 1000, 0);
  voiceWidth = map(highMid, 0, 50, 100, 35);
  voiceOpticalSize = map(treble, 0, 20, 50, 10);
  voiceContrast = map(treble, 0, 20, 0, 1000);
  voiceHrot = map(lowMid, 0, 200, -45, 45);
  voiceVrot = map(highMid, 0, 50, -45, 45);
  voiceShape = map(highMid, 0, 50, 1, 16);
  voiceGrid = map(mid, 0, 50, 1.0, 2.0);
  voiceStripe = map(treble, 0, 20, 0, 1000);
  voiceWorm = map(highMid, 0, 50, 0, 1000);

  variable.style('font-variation-settings', 
  " 'wght' " + ((voiceWeight) * sensitivity) + // AMSTELVAR, KYIV, HANDJET
  ", 'wdth' " + (voiceWidth * sensitivity) + // AMSTELVAR
  ", 'opsz' " + (voiceOpticalSize * sensitivity) + // AMSTELVAR
  ", 'CONT' " + (voiceContrast * sensitivity) + // KYIV
  ", 'HROT' " + (voiceHrot * sensitivity) + // TILTWARP
  ", 'VROT' " + (voiceVrot * sensitivity) + // TILTWARP
  ", 'ESHP' " + (voiceShape * sensitivity) + // HANDJET
  ", 'EGRD' " + (voiceGrid * sensitivity) + // HANDJET
  ", 'WMX2' " + (voiceWeight * sensitivity) + // DECOVAR
  ", 'SKLD' " + (voiceStripe * sensitivity) + // DECOVAR
  ", 'SKLB' " + (voiceWorm * sensitivity)  // DECOVAR
  );

  variable.style('font-size', (100 + (voiceWeight * 0.05)) + "px");

  // ARDUINO

  var data = [];
  data = latestData.split(",");
  console.log(data[3] + ' ' + data[4] + ' ' + data[5]);

  // 3 - voice to speech
  // 4 - save
  // 5 - unassigned 

  if(data[4] == 0)
  {
    saveType();
  }

  if(data[3] == 0)
  {
    startRecognition();
  }



  let rLowMid = map(mid, 0, 200, 0, 20);
  let rMid = map(mid, 0, 50, 0, 20);
  let rHighMid = map(highMid, 0, 50, 0, 20);
  let rTreble = map(treble, 0, 20, 0, 20);

  stroke(50);
  fill(240,200);
  circle(width/2 - 150, 100, rLowMid);
  circle(width/2 - 50, 100, rMid);
  circle(width/2  + 50, 100, rHighMid);
  circle(width/2 + 150, 100, rTreble);
}

// STOP RECORDING & RANDOMISE COLOURS

recognition.onspeechend = function() {
  recognition.stop();

let index = Math.random();
index *= palette.length;
index = Math.floor(index);

var textColor = document.getElementById("words");
words.style.color = (palette[index]);
document.body.style.backgroundColor = (palette[index -1]);
}


function saveType(){
console.log('mousePressed');


  html2canvas(document.body, {

    width: width,
    height: 1080,
    backgroundColor: document.body.style.backgroundColor

  }).then(function(canvas) {
    //document.body.appendChild(canvas);
    //var canvas = document.getElementById('canvas');
console.log('htmlcanvas', canvas);
    canvas.toBlob(blob => {
    // Create a base64 URL of the blob.
    const url = window.URL.createObjectURL(blob);
    
    // Create a new link/a tag.
    const link = document.createElement('a')
    console.log('blob');
    // Add the base64 string as the destination of the link,
    // plus some other properties for downloading.
    link.target = '_blank';
    link.download = 'img.png';
    link.href = url;
    
    // Click it. Automagically.
    link.click()
    
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    })
});
}


// TRIAL CODE FOR ALTERING SIZE

// let para = document.getElementById('words');

// // Grabbing the text
// let text = para.innerText;
// // Getting rid of the text
// para.innerText = '';

// // Create a new span per letter, and appending to the paragraph
// for(let i = 0; i < text.length; i++)
// {
//   let span = document.createElement('span');
//   span.innerText = text[i];
  
//   span.style.fontSize = Math.floor(Math.random() * 50) + 'px';
//   para.appendChild(span);
// }
