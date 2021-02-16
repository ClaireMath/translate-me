// var enonciation = new SpeechSynthesisUtterance (' Bonjour tout le monde ');
// Window.speechSynthesis.speak (enonciation);


// function synthese(){

// if (!('speechSynthesis' in window)) alert("non supportée")  
// else { Votre logiciel de traitement}

// }


// function resumeInfinity() {  
//     window.speechSynthesis.resume();  
//     timeoutResumeInfinity = setTimeout(resumeInfinity, 1000);  
// }  
  
// // Démarrer le resume() permanent sur l'évènement onstart  
// utt.onstart = function(event) {   
//     resumeInfinity(); // truc pour les messages supérieurs à 250 caractères  
//     displayInfo('Démarrage de la synthèse (onstart)','informations');   
// }  
  
// // Arréter le resume() permanent sur l'évènement onend  
// utt.onend = function(event) {  
//     totalElapsedTime += event.elapsedTime;  
//     displayInfo('Fin de la synthèse(onend)<br />Durée (<b>event.elapsedTime</b>) ' + totalElapsedTime + ' millisecondes.','informations');  
//     clearTimeout(timeoutResumeInfinity); // truc pour les messages supérieurs à 250 caractères  
// }   


// function initSynthese(){  
//     try{  
//         synth = window.speechSynthesis;  
//         utt = new SpeechSynthesisUtterance();  
//     }  
//     catch(e) {.......}  
// }  

// function setUtterance(_lang,_voiceTheme,_volume,_pitch,_rate){  
//     try{  
//         utt.volume = _volume; // 0 à 1  
//         utt.pitch = _pitch; //0 à 2  
//         utt.rate = _rate; // 0.1 à 10  
      
//         synth.getVoices().forEach(function(voice) {  
//             if(voice.lang === _lang && voice.name === _voiceTheme) {  
//                 utt.voice = voice;  
//             }  
//         });  
//     }  
//     catch(e){...);}  
// }  

// function setUtteranceEvents(){  
//     try{  
//         // Initialisation des évènements  
//         utt.onend = function(event) { ... }  
//         utt.onerror = function(event) { ... }  
//         utt.onstart = function(event) { ... }  
//         utt.onpause = function(event) { ... }   
//         utt.onresume = function(event){ ... }  
//     }  
//     catch(e){...}  
// }  

// synth.speak(utt);  

// setTimeout("starSupervision()",1000);  
// setTimeout("afficheVoixDisponible()",1000);  




