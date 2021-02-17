from googletrans import Translator

sentence = (input('Dis ...'))

translator = Translator()

translated_sentence = translator.translate(sentence ,src='fr', dest='en')

print(translated_sentence.text)