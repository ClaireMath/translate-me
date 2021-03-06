// Getting all my buttons and placing them in variables :
var micro = document.getElementById("micro");
var microStop = document.getElementById("microStop");
var translateButton = document.getElementById("translateButton");
var downloadButton = document.getElementById("downloadButton");
var apiUrl = "";

//initialize all variables
var leftchannel = [];
var rightchannel = [];
var recorder = null;
var recordingLength = 0;
var volume = null;
var mediaStream = null;
var sampleRate = 44100;
var context = null;
var blob = null;
var downloadUrl;

// vendor prefixes to obtain user consent for older browsers
navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

// Setting event listeners on my buttons :
micro.addEventListener("click", startTheMike);
function startTheMike() {
    leftchannel = [];
    rightchannel = [];
    micro.style.cssText = "display: none;";
    microStop.style.cssText = "display: flex; border: solid white; padding: 5px;";

    // Initialize recorder
    if (typeof navigator.mediaDevices.getUserMedia === "undefined") {
        navigator.getUserMedia({
                audio: true,
            },
            streamHandler,
            errorHandler
        );
    } else {
        navigator.mediaDevices
            .getUserMedia({
                audio: true,
            })
            .then(streamHandler)
            .catch(errorHandler);
    }
}

function streamHandler(e) {
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

    recorder.onaudioprocess = function(e) {
        leftchannel.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        rightchannel.push(new Float32Array(e.inputBuffer.getChannelData(1)));
        recordingLength += bufferSize;
    };

    // we connect the recorder
    mediaStream.connect(recorder);
    recorder.connect(context.destination);
}

function errorHandler(e) {
    console.error(e);
}

// setting event listeners on the crossed mike
microStop.addEventListener("click", stopTheMike);
function stopTheMike() {
  // changing the style of the mikes icons on click
    microStop.style.cssText = "display: none;";
    micro.style.cssText = "display: flex; border: solid white; padding: 5px;";

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

    // our final blob ( = Binary Large Objects)
    blob = new Blob([view], { type: "audio/wav" });
}

// setting event listeners on our translate button
translateButton.addEventListener("click", sendToTranslate);
function sendToTranslate() {
    if (blob == null) {
        window.alert("Veuillez enregistrer votre voix d'abord.");
        return;
    } else {
        let soundFile = new File([blob], "sound");
        let formData = new FormData();
        //Adding files to the formdata
        formData.append("sound", soundFile);
        formData.append("upload_file", true);

        // ajax request = (Asynchronous JavaScript And XML)
        $.ajax({
            type: "POST",
            url: apiUrl + "/translate",
            // as we wanted to pass a sound in our XHR request (XmlHttpRequest),
            // we needed the date to be of formdata format
            data: formData,
            processData: false,
            contentType: false,
        // ajax's promiss    
        }).then(function(data) {

            // Using data.originalText & data.translatedText & display the texts to the user
            // Function to get a majuscule to the first letter
            function capitalizeFirstLetter(string) {
              return string.charAt(0).toUpperCase() + string.slice(1);
            }
            // display our text in French 
            let frenchP = document.getElementById("textSaid");
            let originalTextWithMaj = capitalizeFirstLetter(data.originalText);
            frenchP.innerText = originalTextWithMaj+".";
            // display our text in English
            let englishP = document.getElementById("textTranslated");
            let translatedTextWithMaj = capitalizeFirstLetter(data.translatedText);
            englishP.innerText = translatedTextWithMaj+".";
            // Download the sound from the data.soundUrl url with $ .ajax
            // to play it via the browser
            var audiotranslate = new Audio(data.soundUrl);
            audiotranslate.play();
            downloadUrl = data.soundUrl

            // setting an event listener on our download button
        });

    }
}

downloadButton.addEventListener("click", downloadTranslatedSound);
function downloadTranslatedSound() {
  
    if (blob == null) {
        window.alert("Veuillez enregistrer votre voix d'abord.");
        return;
    } else {
        // var downloadUrl = data.soundUrl;
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = downloadUrl;
        a.download = "sample.wav";
        a.click();

    }
}
//////////

// var ar = document.getElementById("ar");
// ar.value = "Arabe";

// var val = document.getElementById("ar").value;
// ar.addEventListener("select", changelanguage);

// function changelanguage(value) {
//     if (ar.value == "Arabe") {
//         console.log("Langue cible : arabe");

//     } else {
//         console.log("Probleme");
//     }

// }
///////////////

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

    for (var index = 0; index < length;) {
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