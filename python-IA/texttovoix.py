from gtts import gTTS
import os


myText = 'hello'

language = 'fr'

output = gTTS(text=myText, lang=language, slow=False)

output.save('output.mp3')


os.system('start output.mp3')