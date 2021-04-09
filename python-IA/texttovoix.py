from gtts import gTTS
import os


myText = 'Bonjour!'

language = 'fr'

output = gTTS(text=myText, lang=language, slow=False)

output.save('output.mp3')


os.system('afplay output.mp3')