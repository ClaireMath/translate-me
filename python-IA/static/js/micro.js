// Getting all my buttons and placing them in variables :
var micro = document.getElementById("micro");
var microStop = document.getElementById("microStop");
var translateButton = document.getElementById("translateButton");
var downloadButton = document.getElementById("downloadButton");
console.log(translateButton);
var apiUrl = ''

var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var volume = null;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;

// Setting event listeners on my buttons :
micro.addEventListener("click", function () {
  // Initialize recorder
//   navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  navigator.getUserMedia(
    {
      audio: true,
    },
    function (e) {
      // console.log("consentement utilisateur");

      // creates the audio context
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();

      // creates an audio node from the microphone incoming stream
      mediaStream = context.createMediaStreamSource(e);

      // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
      // bufferSize: the onaudioprocess event is called when the buffer is full
      var bufferSize = 2048;
      var numberOfInputChannels = 2;
      var numberOfOutputChannels = 2;
      if (context.createScriptProcessor) {
        recorder = context.createScriptProcessor(
          bufferSize,
          numberOfInputChannels,
          numberOfOutputChannels
        );
      } else {
        recorder = context.createJavaScriptNode(
          bufferSize,
          numberOfInputChannels,
          numberOfOutputChannels
        );
      }

      recorder.onaudioprocess = function (e) {
        leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
        recordingLength += bufferSize;
      };

      // we connect the recorder
      mediaStream.connect(recorder);
      recorder.connect(context.destination);
    },
    function (e) {
      console.error(e);
    }
  );
});

microStop.addEventListener("click", function () {
  // stop recording
  recorder.disconnect(context.destination);
  mediaStream.disconnect(recorder);

  // we flat the left and right channels down
  // Float32Array[] => Float32Array
  var leftBuffer = flattenArray(leftchannel, recordingLength);
  var rightBuffer = flattenArray(rightchannel, recordingLength);
  // we interleave both channels together
  // [left[0],right[0],left[1],right[1],...]
  var interleaved = interleave(leftBuffer, rightBuffer);

  // we create our wav file
  var buffer = new ArrayBuffer(44 + interleaved.length * 2);
  var view = new DataView(buffer);

  // RIFF chunk descriptor
  writeUTFBytes(view, 0, "RIFF");
  view.setUint32(4, 44 + interleaved.length * 2, true);
  writeUTFBytes(view, 8, "WAVE");
  // FMT sub-chunk
  writeUTFBytes(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunkSize
  view.setUint16(20, 1, true); // wFormatTag
  view.setUint16(22, 2, true); // wChannels: stereo (2 channels)
  view.setUint32(24, sampleRate, true); // dwSamplesPerSec
  view.setUint32(28, sampleRate * 4, true); // dwAvgBytesPerSec
  view.setUint16(32, 4, true); // wBlockAlign
  view.setUint16(34, 16, true); // wBitsPerSample
  // data sub-chunk
  writeUTFBytes(view, 36, "data");
  view.setUint32(40, interleaved.length * 2, true);

  // write the PCM samples
  var index = 44;
  var volume = 1;
  for (var i = 0; i < interleaved.length; i++) {
    view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
    index += 2;
  }

  // our final blob
  blob = new Blob([view], { type: "audio/wav" });
});

translateButton.addEventListener("click", function () {
  if (blob == null) {
    console.log("je suis dans le if blob == null");
    window.alert("Veuillez enregistrer votre voix d'abord.");
    return;
  }

  var url = window.URL.createObjectURL(blob);
  var audio = new Audio(url);
  // audio.play();

  // New code
  let soundFile = new File([blob], "sound")
  let formData = new FormData();
  //Adding files to the formdata
  formData.append("sound", soundFile);
  formData.append("upload_file", true)

  console.log("je crée le blob");
  
  $.ajax({
    type: 'POST',
    url: apiUrl + '/translate',
    data: formData,
    processData: false,
    contentType: false,    
  }).then(function (data) {
    console.log("je suis dans la promesse du ajax");
     // Using data.originalText & data.translatedText & display the texts to the user
    let frenchP = document.getElementById('textSaid');
    frenchP.innerText = data.originalText;
    let englishP = document.getElementById('textTranslated');
    englishP.innerText = data.translatedText;
    // Télécharger le son depuis l'url data.soundUrl avec $.ajax
    // Le faire jouer par le navigateur
    downloadButton.addEventListener("click", function () {
      document.location.href=data.soundUrl;
    });
    //  document.location.href=data.soundUrl; 
  });
});
/////////////////////////////

downloadButton.addEventListener("click", function () {
  if (blob == null) {
  window.alert("Veuillez enregistrer votre voix d'abord.");
  return;
  }
});
//   var url = URL.createObjectURL(blob);

//   var a = document.createElement("a");
//   document.body.appendChild(a);
//   a.style = "display: none";
//   a.href = url;
//   a.download = "sample.wav";
//   a.click();
//   window.URL.revokeObjectURL(url);
// });

function flattenArray(channelBuffer, recordingLength) {
  var result = new Float32Array(recordingLength);
  var offset = 0;
  for (var i = 0; i < channelBuffer.length; i++) {
    var buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function interleave(leftChannel, rightChannel) {
  var length = leftChannel.length + rightChannel.length;
  var result = new Float32Array(length);

  var inputIndex = 0;

  for (var index = 0; index < length; ) {
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeUTFBytes(view, offset, string) {
  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}