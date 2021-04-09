from flask import Flask, request
import logging
import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
import os
 
r = sr.Recognizer()
app = Flask(__name__)

@app.route("/", methods=['GET', 'POST'])
def main():
    logging.warning("data")
    data = request.form['sound']
    if data != None :
        try:
            voice = r.recognize_google(data, language="fr-FR")

            print("Vous avez dit : {}" .format(voice))

        except:
            print('Sorry, try again !')

        translator = Translator()
        translated_sentence = translator.translate(format(voice), dest='en', src='fr')
        print('voici sa traduction :')
        print(translated_sentence.text)

        myText = translated_sentence.text

        language = 'en'

        output = gTTS(text=myText, lang=language, slow=False)

        output.save('output.mp3')

        os.system('start output.mp3')

     #  return "coucou"
