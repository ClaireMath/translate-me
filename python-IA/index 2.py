#coding:utf-8
import cgi

print("Content-type: text/html; charset=utf-8\n")


html = """<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Bitter:wght@100&family=Playfair+Display&display=swap"
    rel="stylesheet">
    <!-- <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script> -->
    <!--bibliothèque TensorFlow -->
    <!-- <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/speech-commands"></script> -->
    <!--modele de commandes vocales pré-entrainé -->
    <title>TranslateMe</title>
</head>

<body>

    <header>
      <img class="logo" src="./img/logo.png" alt="logo translateMe">
    </header>

    <div class="ctn">

    <h1>OBTENEZ UNE TRADUCTION VOCALE GRATUITE ET INSTANTANNÉE !</h1>
    <div class="divMike">
    <img src="./img/micro.png" alt="micro" id="micro" class="micro">
    <img src="./img/crossedMike.png" alt="micro" id="microStop" class="micro">
    </div>
    <div class="divMike">
    <button class="gb gb2" id="playButton">PLAY</button>
    <button id="downloadButton" class="gb gb1">DOWNLOAD</button>
    </div>
    <div class="ctn-translate">

    <p>FRANÇAIS</p>

    <p>ANGLAIS</p>

    </div>

    <div class="ctnTextArea">

    <div class="areaOfTxt">
    <p class="textSaid"></p>
    </div>

    <div class="areaOfTxt">
    <p class="textTranslated"></p>
    </div>
    </div>

    </div>

    <div class="ctn-img">
    <img src="./img/man.png" alt="man" class="img2">
    </div>

    </div>

    <textarea cols="50" id="speech" ></textarea>
    <input width=15px height=20px background-color=transparent
    id="mic" onwebkitspeechchange="transcribe(this.value)" x-webkit-speech>

    <!-- <div class ="translate"></div> -->
    <!-- <script src="index.js"></script> -->


    <script src="./js-machinelearning/vocal.js"></script>
    <script src="./micro/micro.js"></script>
</body>
</html>
"""


print(html)