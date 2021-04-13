////////////////////////////////////////////////////////////


// TensorFlow.js est une bibliothèque JavaScript qui permet d'entraîner et de déployer des modèles de machine learning 
// dans le navigateur et sur Node.js.

// Nous avons souhaité garder cette partie afin de montrer les étapes de déroulement du projet.
// Nous avions tout d'abord décidé de commencer par entrainer un petit modèle à faire des prédictions
// de mots à partir de données, lui permettant de reconnaitre/associer les différents mots à leurs intonnations/voix.

// Cette partie fut très interessante et formatrice cependant, pas la plus rapide et optimale.

// C'est pour cela que nous avons décidé d'opter pour une stratégie différente.



///////////////////////////////////////////////////////////

let recognizer;

function predictWord() {
    // Array of words that the recognizer is trained to recognize.
    const words = recognizer.wordLabels();
    recognizer.listen(({ scores }) => {
        // Turn scores into a list of (score,word) pairs.
        scores = Array.from(scores).map((s, i) => ({ score: s, word: words[i] }));
        // Find the most probable word.
        scores.sort((s1, s2) => s2.score - s1.score);
        document.querySelector('#console').textContent = scores[0].word;
    }, { probabilityThreshold: 0.75 }); // = controls how often the pattern triggers - 0.75 means the pattern will trigger when it is more than 75% sure to hear a given word.
}

async function app() {
    recognizer = speechCommands.create('BROWSER_FFT');
    await recognizer.ensureModelLoaded();
    //  predictWord();
    buildModel(); // Call buildModel() when app is charging
}

app();


// One frame is ~23ms of audio.
// collect () associates a label with the output of recognizer.listen (). Since includeSpectrogram is true, recognizer.listen () gives the raw spectrogram (frequency data) for 1 second of audio, divided into 43 frames, so each frame represents ~ 23ms of audio:
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
    recognizer.listen(async({ spectrogram: { frameSize, data } }) => {
        let vals = normalize(data.subarray(-frameSize * NUM_FRAMES)); // <- Since we want to use short sounds instead of words to control the cursor, we only consider the last 3 frames (~ 70ms):
        examples.push({ vals, label }); // stock data in this variable
        document.querySelector('#console').textContent =
            `${examples.length} examples collected`;
    }, {
        overlapFactor: 0.999,
        includeSpectrogram: true,
        invokeCallbackOnNoiseAndUnknown: true
    });
}

function normalize(x) {
    // And to avoid numerical problems, we normalize the data to have a mean of 0 and a standard deviation of 1. In this case, the spectrogram values ​​are usually large negative numbers around -100 and a deviation of 10:
    const mean = -100;
    const std = 10;
    return x.map(x => (x - mean) / std);
}


const INPUT_SHAPE = [NUM_FRAMES, 232, 1]; // The input form of the template is the [NUM_FRAMES, 232, 1] place where each frame corresponds to 23 ms of audio containing 232 numbers which correspond to different frequencies (232 was chosen because it is the amount of frequency bands needed to capture the human voice). In this codelab, we are using samples with a length of 3 frames (~ 70 ms samples) because we are producing sounds instead of speaking whole words to control the cursor.
let model;

async function train() {
    toggleButtons(false);
    const ys = tf.oneHot(examples.map(e => e.label), 3);
    const xsShape = [examples.length, ...INPUT_SHAPE];
    const xs = tf.tensor(flatten(examples.map(e => e.vals)), xsShape);

    // The training spans 10 times (epochs) over the data using a batch size of 16 (processing 16 examples at a time) and shows the current accuracy in the user interface:

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
    // MODEL ARCHITECTURE = The model has 4 layers: a convolutional layer which processes the audio data (represented in the form of a spectrogram), a max pool layer, a flattened layer and a dense layer which corresponds to the 3 actions:
    model = tf.sequential();
    model.add(tf.layers.depthwiseConv2d({
        depthMultiplier: 8,
        kernelSize: [NUM_FRAMES, 3],
        activation: 'relu',
        inputShape: INPUT_SHAPE
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: [1, 2], strides: [2, 2] }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 3, activation: 'softmax' })); // end of ARCHI MODEL

    // compilation of the model to prepare it to the traininh:
    const optimizer = tf.train.adam(0.01); // adam = common optimizer used in deep learning
    model.compile({
        optimizer,
        loss: 'categoricalCrossentropy', // categoricalCrossentropy = measures the distance between the predicted probabilities (one probability per class) and a probability of 100% in the true class and 0% for all other classes
        metrics: ['accuracy'] // accuracy = metric to watch, which will give us the percentage of examples the model gets correct after each training epoch.
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

//listen() listen to the microphone and make predictions in real time. The code is very similar to the collect () method, which normalizes the raw spectrogram and removes all but the last NUM_FRAMESimages. The only difference is that we also call the trained model to get a prediction:
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

    recognizer.listen(async({ spectrogram: { frameSize, data } }) => {
        const vals = normalize(data.subarray(-frameSize * NUM_FRAMES));
        const input = tf.tensor(vals, [1, ...INPUT_SHAPE]);
        // the end of model.predict(input) is a tensor of form [1, numClasses] representing a probability distribution over the number of classes. More simply, it is simply a set of confidences for each of the possible output classes which add up to 1. The Tensor has an outer dimension of 1 because it is the size of the lot (only one example).
        const probs = model.predict(input); // call of the model go for prediction here
        const predLabel = probs.argMax(1); // call here + To convert the probability distribution to a single integer representing the most probable class, we call probs.argMax (1) which returns the class index with the highest probability. We pass a "1" as the axis parameter because we want to calculate the argMaxcourse of the last dimension, numClasses.
        await moveSlider(predLabel); // call here + moveSlider() decreases the value of the slider if the label is 0 ("left"), increases it if the label is 1 ("right") and ignores if the label is 2 ("noise").

        tf.dispose([input, probs, predLabel]); // Eliminate Tensors = To clean up GPU memory, it is important for us to manually call tf.dispose () on the output Tensors. The alternative to the tf.dispose () manual is to wrap the function calls in a tf.tidy (), but this cannot be used with asynchronous functions.


    }, {
        overlapFactor: 0.999,
        includeSpectrogram: true,
        invokeCallbackOnNoiseAndUnknown: true
    });
}