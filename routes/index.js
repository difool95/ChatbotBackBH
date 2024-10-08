var express = require('express');
var router = express.Router();
var textToSpeech = require('../helpers/tts');
const fs = require('fs')
const { Deepgram } = require('@deepgram/sdk')
const deepgram = new Deepgram('0e4c7bd55c83ac72d8f16725e497569e89574f38')
const axios = require('axios');
const mime = require('mime-types');
const path = require('path');
const host = 'https://chatbotbackbh.onrender.com'
/* GET home page. */
router.post('/talk', function (req, res) {
  let language = req.body.language;
  textToSpeech(req.body.text, req.body.language, req.body.reset)
    .then(result => {
      let { blendData, filename, filena } = result;
      axios.post(host + '/subtitle', { filena, language })
        .then((response) => {
          //console.log(response.data);
          res.json(result);
          console.log("done");
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch(err => {
      res.json({});
    });
});

// Specify the file name and content
const fileNameEnglish = 'contextFileEnglish.txt';
const fileNameFrench = 'contextFileFrench.txt';
const fileNameArabic = 'contextFileArabic.txt';

router.post('/SetupContextEnglish', function (req, res) {
  // Write the content to the file
  let context = req.body.context;


  // Check if the file exists
  fs.access(fileNameEnglish, fs.constants.F_OK, (err) => {
    if (err) {
      // The file doesn't exist, so create it with the new text
      fs.writeFile(fileNameEnglish, context, 'utf8', (err) => {
        if (err) {
          console.error('Error creating the file:', err);
        } else {
          res.send("context updated");
          console.log('File created with new content.');
        }
      });
    } else {
      // The file exists, so delete its content and append the new text
      fs.truncate(fileNameEnglish, 0, (err) => {
        if (err) {
          console.error('Error truncating the file:', err);
        } else {
          fs.appendFile(fileNameEnglish, context, 'utf8', (err) => {
            if (err) {
              console.error('Error appending text to the file:', err);
            } else {
              res.send("context updated");
              console.log('Text appended to the file after truncation.');
            }
          });
        }
      });
    }
  });
});

router.post('/SetupContextFrench', function (req, res) {
  // Write the content to the file
  let context = req.body.context;


  // Check if the file exists
  fs.access(fileNameFrench, fs.constants.F_OK, (err) => {
    if (err) {
      // The file doesn't exist, so create it with the new text
      fs.writeFile(fileNameFrench, context, 'utf8', (err) => {
        if (err) {
          console.error('Error creating the file:', err);
        } else {
          res.send("context updated");
          console.log('File created with new content.');
        }
      });
    } else {
      // The file exists, so delete its content and append the new text
      fs.truncate(fileNameFrench, 0, (err) => {
        if (err) {
          console.error('Error truncating the file:', err);
        } else {
          fs.appendFile(fileNameFrench, context, 'utf8', (err) => {
            if (err) {
              console.error('Error appending text to the file:', err);
            } else {
              res.send("context updated");
              console.log('Text appended to the file after truncation.');
            }
          });
        }
      });
    }
  });
});

router.post('/SetupContextArabic', function (req, res) {
  // Write the content to the file
  let context = req.body.context;


  // Check if the file exists
  fs.access(fileNameArabic, fs.constants.F_OK, (err) => {
    if (err) {
      // The file doesn't exist, so create it with the new text
      fs.writeFile(fileNameArabic, context, 'utf8', (err) => {
        if (err) {
          console.error('Error creating the file:', err);
        } else {
          res.send("context updated");
          console.log('File created with new content.');
        }
      });
    } else {
      // The file exists, so delete its content and append the new text
      fs.truncate(fileNameArabic, 0, (err) => {
        if (err) {
          console.error('Error truncating the file:', err);
        } else {
          fs.appendFile(fileNameArabic, context, 'utf8', (err) => {
            if (err) {
              console.error('Error appending text to the file:', err);
            } else {
              res.send("context updated");
              console.log('Text appended to the file after truncation.');
            }
          });
        }
      });
    }
  });
});

router.post('/clearStorage', function (req, res) {
  const folderPath = path.join(__dirname, '../public'); // Replace with the actual path of the folder you want to delete files from

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Deleted file: ${filePath}`);
      });
    });
  });
})
router.post('/subtitle', function (req, res) {
  var randomString2 = req.body.filena
  var language = req.body.language;
  let languageOption = "";
  if (language == "french") {
    languageOption = ""
  }
  if (language == "english") {
    languageOption = "en"
  }
  if (language == "arabic") {
    languageOption = "";
  }
  if (languageOption != "") {

    fs.readFile(path.join(__dirname, '../public/speech-') + randomString2 + ".mp3", (error, data) => {
      if (error) {
        console.error(error);
      } else {
        // 'data' contains the buffer of the audio file
        const mimeType = mime.lookup(path.join(__dirname, '../public/speech-') + randomString2 + ".mp3"); // Get the MIME type based on the file path

        deepgram.transcription
          .preRecorded(
            {
              buffer: data,
              mimetype: mimeType
            },
            { punctuate: true, utterances: true, language: languageOption }
          )
          .then((response) => {
            // WebVTT Filename
            const stream = fs.createWriteStream(path.join(__dirname, '../public/') + randomString2 + '.vtt', { flags: 'a' })
            stream.write(response.toWebVTT());
            //console.log(response.toWebVTT());
            //var subtitlestring = response.toWebVTT();
            //const modifiedString = subtitlestring.replace("dièse", "#");
            //console.log(modifiedString);

            res.json(true);
          })
          .catch((error) => {
            console.log({ error })
          })
      }
    });
  }
  else {
    res.json(true);
  }


})
module.exports = router;
