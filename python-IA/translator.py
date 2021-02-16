# import tensorflow as tf
# from tensorflow import keras
# from tensorflow.keras import layers

# inputs = keras.Input(shape=(784,))


# print("bonjour")

# import requests

# url = "https://speech.googleapis.com/v1p1beta1/speech:recognize"
# reponse = requests.get(url)
# contenu = reponse.json()

# print(reponse)


# def translate ():
#     rawText = raw_input
#     rawText = rawtext.replace



# # Imports the Google Cloud client library
# from google.cloud import speech

# # Instantiates a client
# client = speech.SpeechClient()

# # The name of the audio file to transcribe
# gcs_uri = "gs://cloud-samples-data/speech/brooklyn_bridge.raw"

# audio = speech.RecognitionAudio(uri=gcs_uri)

# config = speech.RecognitionConfig(
#     encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
#     sample_rate_hertz=16000,
#     language_code="en-US",
# )

# # Detects speech in the audio file
# response = client.recognize(config=config, audio=audio)

# for result in response.results:
#     print("Transcript: {}".format(result.alternatives[0].transcript))

# from speech_recognition import Recognizer, Microphone
# recognizer = Recognizer()
# # On enregistre le son
# with Microphone() as source:
#     print("Réglage du bruit ambiant... Patientez...")
#     recognizer.adjust_for_ambient_noise(source)
#     print("Vous pouvez parler...")
#     recorded_audio = recognizer.listen(source)
#     print("Enregistrement terminé !")
#     with open('record.wav' , 'wb') as f:
#         f.write( audio.get_wav_data() )
    
# # Reconnaissance de l'audio
# try:
#     print("Reconnaissance du texte...")
#     text = recognizer.recognize_google(
#             recorded_audio, 
#             language="fr-FR"
#         )
#     print("Vous avez dit : {}".format(text))
# except Exception as ex:
#     print(ex)