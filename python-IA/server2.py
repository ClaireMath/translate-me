from flask import Flask, request, render_template, jsonify
import random, string
import logging
import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
from flask_cors import CORS 
import os

# import FLASK : web application framework. Designed to make getting started quick and easy.
# import random, string : generate random string
# import logging : logging is a means of tracking events that happen when some software runs.
# import speech recognition : library for performing speech recognition, with support for several engines and APIs, online and offline.
# import googletrans : free and unlimited python library that implemented Google Translate API.
# import gTTS (Google Text-to-Speech) : a Python library and CLI tool to interface with Google Translate's text-to-speech API.
# import flask_cors : A Flask extension for handling Cross Origin Resource Sharing (CORS), making cross-origin AJAX possible.
# import os : OS module provides easy functions that allow us to interact and get Operating System information and even control processes up to a limit.


r = sr.Recognizer()
app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = './static/sounds'


# define a random string for each new wav file
def get_random_string():
    return ''.join(random.choice(string.ascii_letters) for _ in range(10))

def get_audio_data_from_file(soundFile):
    wavfile = sr.WavFile(soundFile)
    with wavfile as source:
        return sr.AudioData(
            source.stream.read(), wavfile.SAMPLE_RATE,
            wavfile.SAMPLE_WIDTH)


# open a way to index.html
@app.route("/")
def main():
    return render_template('index.html')

# open a way with post method to send soundfile convert to text and translate sentence (text+voice) into javascript
@app.route("/translate", methods=['POST'])
def translate():
    logging.warning("data")
    soundFile = request.files['sound']
    
    if soundFile != None :
        
        # collect the sound data to convert it into text format, translates it 
        # into the expected language in text format as well as in sound format recorded in a sound file,
        # by a random and unique name (.mp3)
        # return json module
        audio_data = get_audio_data_from_file(soundFile)
        original_text = r.recognize_google(audio_data=audio_data, language="fr-FR")


        print("Vous avez dit : {}" .format(original_text))

        translator = Translator()
        translated_sentence = translator.translate(original_text, dest='en', src='fr')
        print('voici sa traduction :')
        print(translated_sentence.text)

        myText = translated_sentence.text

        language = 'en'
        
        #############
        # Français : fr
        # Anglais : en
        # Arabe : ar
        # Chinois : zh
        # Allemand : de
        # Italien : il
        # Russe : ru
        # Espagnol : es
        #############

        output = gTTS(text=myText, lang=language, slow=False)

        uniqStr = get_random_string()
        output.save('./static/sounds/' + uniqStr + '.mp3')

        # os.system('afplay ./static/sounds/' + uniqStr + '.mp3')
        # os.system('start ./static/sounds/' + uniqStr + '.mp3')

        return jsonify({ 'originalText': original_text, 'translatedText': myText, 'soundUrl': '/static/sounds/' + uniqStr + '.mp3' })

    else :
        return jsonify('Veuillez enregistrer votre voix')

if __name__ == "__main__":
    app.run()