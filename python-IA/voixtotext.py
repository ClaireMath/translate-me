import speech_recognition as sr

r = sr.Recognizer()

with sr.Microphone() as source:
    print("Parlez  : ")
    audio = r.listen(source)

# print("You said: " + r.recognize_google(audio) + "in french")
# except sr.UnknownValueError:
# print("

# try:
#     voice = r.recognize_google(audio, language="fr-FR")
# except sr.UnknownValueError:
#     speak('understand')
# return voice

    try:
        voice = r.recognize_google(audio, language="fr-FR")
        print("Vous avez dit : {}" .format(voice))

    except:
        print('Sorry, try again !')
        