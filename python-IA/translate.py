from googletrans import Translator

sentence = str(input('Dis une phrase à traduire en anglais'))

translator = Translator()

translated_sentence = translator.translate(sentence, dest='en', src='fr')

print('voici sa traduction :')
print(translated_sentence.text)