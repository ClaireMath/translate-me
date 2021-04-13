import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
import os


# import of speech recognition = Library for performing speech recognition, with support for several engines and APIs, online and offline.
# import googletrans : free and unlimited python library that implemented Google Translate API.
# import gTTS (Google Text-to-Speech) : a Python library and CLI tool to interface with Google Translate's text-to-speech API.
# import os : OS module provides easy functions that allow us to interact and get Operating System information and even control processes up to a limit.


# collect the sound data to convert it into text format, translates it 
# into the expected language in text format as well and in sound format recorded in a sound file.


r = sr.Recognizer()

with sr.Microphone() as source:
    print("Parlez  : ")
    audio = r.record(source, duration=4)
    # audio = r.listen(source)

if audio != None :

    try:

        voice = r.recognize_google(audio)
        # voice = r.recognize_google(audio, language="fr-FR")
        
        print("Vous avez dit : {}" .format(voice))

    except:
        print('Sorry, try again !')

translator = Translator()

translated_sentence = translator.translate(voice, dest='en', src="auto")
print('voici sa traduction :')
print(translated_sentence.text)

myText = translated_sentence.text

language = 'en'

output = gTTS(text=myText, lang=language, slow=False)

output.save('output.mp3')


# for mac : 
# os.system('afplay output.mp3')
# for windows :
# os.system('start output.mp3')