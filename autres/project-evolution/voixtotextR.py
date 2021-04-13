import speech_recognition as sr

# import of speech recognition = Library for performing speech recognition, with support for several engines and APIs, online and offline.


# collect the sound data to convert it into text format

r = sr.Recognizer()

for device_index in sr.Microphone.list_microphone_names():
    print (device_index)
    break
else:
    print("No working microphones found!")

with sr.Microphone() as source:
    print("Parlez  : ")
    audio = r.listen(source)

    try:
        voice = r.recognize_google(audio, language="fr-FR")
        print("Vous avez dit : {}" .format(voice))

    except:
        print('Sorry, try again !')