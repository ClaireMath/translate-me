from gtts import gTTS
import os

# import gTTS (Google Text-to-Speech) : a Python library and CLI tool to interface with Google Translate's text-to-speech API.
# import os : OS module provides easy functions that allow us to interact and get Operating System information and even control processes up to a limit.


# convert manual text into .mp3 sound file

myText = 'Bonjour!'

language = 'fr'

output = gTTS(text=myText, lang=language, slow=False)

output.save('output.mp3')


os.system('afplay output.mp3')