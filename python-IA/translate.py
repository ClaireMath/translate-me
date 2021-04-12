from googletrans import Translator
from gtts import gTTS
import os

sentence = str(input('Dis une phrase à traduire en anglais'))

translator = Translator()

translated_sentence = translator.translate(sentence, dest='en', src='fr')

print('voici sa traduction :')
print(translated_sentence.text)


myText = translated_sentence

language = 'fr'

output = gTTS(text=myText, lang=language, slow=False)

output.save('output.mp3')


os.system('start output.mp3')