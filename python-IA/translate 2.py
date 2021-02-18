from googletrans import Translator
from gtts import gTTS
import os

sentence = str(input('Dis ...'))

translator = Translator()

translated_sentence = translator.translate(sentence ,src='fr', dest='en')

print(translated_sentence.text)


myText = translated_sentence

language = 'fr'

output = gTTS(text=myText, lang=language, slow=False)

output.save('output.mp3')


os.system('start output.mp3')