import speech_recognition as sr

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


    try:
        voice = r.recognize_google(audio, language="fr-FR")
        print("Vous avez dit : {}" .format(voice))

    except:
        print('Sorry, try again !')

        