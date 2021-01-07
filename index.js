let recognizer;

function predictWord() {
 // Array of words that the recognizer is trained to recognize.
 const words = recognizer.wordLabels();
 recognizer.listen(({scores}) => {
   // Turn scores into a list of (score,word) pairs.
   scores = Array.from(scores).map((s, i) => ({score: s, word: words[i]}));
   // Find the most probable word.
   scores.sort((s1, s2) => s2.score - s1.score);
   document.querySelector('#console').textContent = scores[0].word;
 }, {probabilityThreshold: 0.75}); // = controle la fréquence à laquelle le modèle se déclenche - 0,75 signifie que le modèle se déclenchera lorsqu'il aura plus de 75% de certitude d'entendre un mot donné.
}

async function app() {
 recognizer = speechCommands.create('BROWSER_FFT');
 await recognizer.ensureModelLoaded();
//  predictWord();
buildModel();  // Appeler buildModel()lorsque l'application se charge
}

app();


// One frame is ~23ms of audio.
// collect()associe a labelà la sortie de recognizer.listen(). Depuis includeSpectrogramest vrai , recognizer.listen()donne le spectrogramme brut (données de fréquence) pour 1 seconde d'audio, divisé en 43 images, donc chaque image représente ~ 23 ms d'audio:
const NUM_FRAMES = 3;
let examples = [];
// console.log()

function collect(label) {
 if (recognizer.isListening()) {
   return recognizer.stopListening();
 }
 if (label == null) {
   return;
 }
 recognizer.listen(async ({spectrogram: {frameSize, data}}) => {
   let vals = normalize(data.subarray(-frameSize * NUM_FRAMES)); // <- Puisque nous voulons utiliser des sons courts au lieu de mots pour contrôler le curseur, nous ne prenons en compte que les 3 dernières images (~ 70 ms):
   examples.push({vals, label}); // stock des données collectés dans cette variable
   document.querySelector('#console').textContent =
       `${examples.length} examples collected`;
 }, {
   overlapFactor: 0.999,
   includeSpectrogram: true,
   invokeCallbackOnNoiseAndUnknown: true
 });
}

function normalize(x) {
    // Et pour éviter les problèmes numériques, nous normalisons les données pour avoir une moyenne de 0 et un écart type de 1. Dans ce cas, les valeurs du spectrogramme sont généralement de grands nombres négatifs autour de -100 et un écart de 10:
 const mean = -100;
 const std = 10;
 return x.map(x => (x - mean) / std);
}


const INPUT_SHAPE = [NUM_FRAMES, 232, 1]; // La forme d'entrée du modèle est l' [NUM_FRAMES, 232, 1]endroit où chaque image correspond à 23 ms d'audio contenant 232 nombres qui correspondent à différentes fréquences (232 a été choisi parce que c'est la quantité de tranches de fréquences nécessaires pour capturer la voix humaine). Dans ce codelab, nous utilisons des échantillons d'une longueur de 3 images (~ 70 ms échantillons) car nous produisons des sons au lieu de prononcer des mots entiers pour contrôler le curseur.
let model;

async function train() {
 toggleButtons(false);
 const ys = tf.oneHot(examples.map(e => e.label), 3);
 const xsShape = [examples.length, ...INPUT_SHAPE];
 const xs = tf.tensor(flatten(examples.map(e => e.vals)), xsShape);

 // La formation passe 10 fois (époques) sur les données en utilisant une taille de lot de 16 (traitement de 16 exemples à la fois) et montre la précision actuelle dans l'interface utilisateur:

 await model.fit(xs, ys, {
   batchSize: 16,
   epochs: 10,
   callbacks: {
     onEpochEnd: (epoch, logs) => {
       document.querySelector('#console').textContent =
           `Accuracy: ${(logs.acc * 100).toFixed(1)}% Epoch: ${epoch + 1}`;
     }
   }
 });
 tf.dispose([xs, ys]);
 toggleButtons(true);
}

function buildModel() {
    // ARCHITECTURE MODELE = Le modèle comporte 4 couches: une couche convolutive qui traite les données audio (représentées sous forme de spectrogramme), une couche de pool max, une couche aplatie et une couche dense qui correspond aux 3 actions:
 model = tf.sequential();
 model.add(tf.layers.depthwiseConv2d({
   depthMultiplier: 8,
   kernelSize: [NUM_FRAMES, 3],
   activation: 'relu',
   inputShape: INPUT_SHAPE
 }));
 model.add(tf.layers.maxPooling2d({poolSize: [1, 2], strides: [2, 2]}));
 model.add(tf.layers.flatten());
 model.add(tf.layers.dense({units: 3, activation: 'softmax'})); // fin ARCHI MODEL
 
 // compilation du modèle pour le préparer à l'entraînement:
 const optimizer = tf.train.adam(0.01); // adam = optimiseur commun utilisé dans l'apprentissage en profondeur
 model.compile({
   optimizer,
   loss: 'categoricalCrossentropy', // categoricalCrossentropy = mesure la distance entre les probabilités prédites (une probabilité par classe) et une probabilité de 100% dans la vraie classe et de 0% pour toutes les autres classes
   metrics: ['accuracy'] // accuracy = métrique à surveiller, ce qui nous donnera le pourcentage d'exemples que le modèle obtient correct après chaque époque d'entraînement.

 });
}

function toggleButtons(enable) {
 document.querySelectorAll('button').forEach(b => b.disabled = !enable);
}

function flatten(tensors) {
 const size = tensors[0].length;
 const result = new Float32Array(tensors.length * size);
 tensors.forEach((arr, i) => result.set(arr, i * size));
 return result;
}


async function moveSlider(labelTensor) {
    const label = (await labelTensor.data())[0];
    document.getElementById('console').textContent = label;
    if (label == 2) {
      return;
    }
    let delta = 0.1;
    const prevValue = +document.getElementById('output').value;
    document.getElementById('output').value =
        prevValue + (label === 0 ? -delta : delta);
   }
   
   //listen()écoute le microphone et fait des prédictions en temps réel. Le code est très similaire à la collect()méthode, qui normalise le spectrogramme brut et supprime toutes les NUM_FRAMESimages sauf les dernières . La seule différence est que nous appelons également le modèle entraîné pour obtenir une prédiction:
   function listen() {
    if (recognizer.isListening()) {
      recognizer.stopListening();
      toggleButtons(true);
      document.getElementById('listen').textContent = 'Listen';
      return;
    }
    toggleButtons(false);
    document.getElementById('listen').textContent = 'Stop';
    document.getElementById('listen').disabled = false;
   
    recognizer.listen(async ({spectrogram: {frameSize, data}}) => {
      const vals = normalize(data.subarray(-frameSize * NUM_FRAMES));
      const input = tf.tensor(vals, [1, ...INPUT_SHAPE]);
      // La sortie de model.predict(input)est un Tenseur de forme [1, numClasses]représentant une distribution de probabilité sur le nombre de classes. Plus simplement, il s'agit simplement d'un ensemble de confidences pour chacune des classes de sortie possibles qui totalisent 1. Le Tensor a une dimension extérieure de 1 car c'est la taille du lot (un seul exemple).
      const probs = model.predict(input); // appel du model entrain pour prediction ici
      const predLabel = probs.argMax(1); // appel ici + Pour convertir la distribution de probabilité en un seul entier représentant la classe la plus probable, nous appelons probs.argMax(1)qui renvoie l'index de classe avec la probabilité la plus élevée. Nous passons un « 1 » comme paramètre d'axe parce que nous voulons calculer le argMaxcours de la dernière dimension, numClasses.
      await moveSlider(predLabel); // appel ici + moveSlider() diminue la valeur du curseur si l'étiquette est 0 ("left"), l'augmente si l'étiquette est 1 ("right") et ignore si l'étiquette est 2 ("noise").


      tf.dispose([input, probs, predLabel]); // Éliminer les tenseurs =  Pour nettoyer la mémoire du GPU, il est important pour nous d'appeler manuellement tf.dispose () sur les Tensors de sortie. L'alternative au manuel tf.dispose()consiste à encapsuler les appels de fonction dans a tf.tidy(), mais cela ne peut pas être utilisé avec les fonctions asynchrones.
      
      
      
    }, {
      overlapFactor: 0.999,
      includeSpectrogram: true,
      invokeCallbackOnNoiseAndUnknown: true
    });
   }




