import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
import os

r = sr.Recognizer()

for device_index in sr.Microphone.list_microphone_names():
    # m = Microphone(device_index=device_index)
    print (device_index)
    break
else:
    print("No working microphones found!")

with sr.Microphone() as source:
    print("Parlez  : ")
    audio = r.listen(source)

if audio != None :
    try:
        voice = r.recognize_google(audio, language="fr-FR")

        print("Vous avez dit : {}" .format(voice))

    except:
        print('Sorry, try again !')

translator = Translator()
translated_sentence = translator.translate(voice, dest='en', src='fr')
print('voici sa traduction :')
print(translated_sentence.text)

myText = translated_sentence.text

language = 'en'

output = gTTS(text=myText, lang=language, slow=False)

output.save('output.mp3')


os.system('start output.mp3')