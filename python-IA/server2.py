from flask import Flask, request, render_template, jsonify
import random, string
import logging
import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
from flask_cors import CORS 
import os

r = sr.Recognizer()
app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = './static/sounds'

def get_random_string():
    return ''.join(random.choice(string.ascii_letters) for _ in range(10))

def get_audio_data_from_file(soundFile):
    wavfile = sr.WavFile(soundFile)
    with wavfile as source:
        return sr.AudioData(
            source.stream.read(), wavfile.SAMPLE_RATE,
            wavfile.SAMPLE_WIDTH)

@app.route("/")
def main():
    return render_template('index.html')

@app.route("/translate", methods=['POST'])
def translate():
    logging.warning("data")
    #data = request.form['sound']
    soundFile = request.files['sound']
    # data = request.form.get('sound')
    if soundFile != None :
        # try:
        audio_data = get_audio_data_from_file(soundFile)
        original_text = r.recognize_google(audio_data=audio_data, language="fr-FR")

        print("Vous avez dit : {}" .format(original_text))

        # except Exception:
        #     print('Sorry, try again!')
        #     return "Sorry, try again!"

        translator = Translator()
        translated_sentence = translator.translate(original_text, dest='en', src='fr')
        print('voici sa traduction :')
        print(translated_sentence.text)

        myText = translated_sentence.text

        language = 'en'

        output = gTTS(text=myText, lang=language, slow=False)
        """uniqStr = ''
        if uniqStr != None :
            uniqStr = None
        else : 
            """
        uniqStr = get_random_string() # TODO: créer une fonction qui génère une chaîne unique
        print(uniqStr)
        output.save('./static/sounds/' + uniqStr + '.mp3')

        # os.system('start ./static/sounds/' + uniqStr + '.mp3')
        return jsonify({ 'originalText': original_text, 'translatedText': myText, 'soundUrl': '/static/sounds/' + uniqStr + '.mp3' })
            #  return "coucou"
    else :
        return jsonify('Veuillez enregistrer votre voix.')

if __name__ == "__main__":
    app.run()