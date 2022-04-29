var express = require("express");
const mysql = require('mysql');
var router = express.Router();

var FileReader = require('filereader');
const fs = require('fs');

function buildPatternTable(pattern) {
    var len = 0 
    var m = pattern.length;
    var patternTable=[0]
    var i = 1
 
    while (i < m){
        if (pattern[i]== pattern[len]){
            len += 1
            patternTable[i] = len
            i += 1
        }
        else{
            if (len != 0){
                len = patternTable[len-1]
            }
             else{
                patternTable[i] = 0
                i += 1
            }
        }
    }
  
    return patternTable;
  }

  
function knuthMorrisPratt(text, pattern){
    var i = 0;
    var j = 0;
    var n = text.length;
    var m = pattern.length;
    const patternTable = buildPatternTable(text);
    while (i < n){
        if (pattern[j] === text[i]){
            i++;
            j++;
        }
        if (j==m){
            j=patternTable[j-1];
            return true;
        }
        else if  (i < n && pattern[j] != text[i]){

            if (j != 0){
                j = lps[j-1]
            }
            else{
                i += 1
            }
        }
    }
}

function checkInput(text){
    var regexAllCaps = /^[A-Z]*$/;
    var regexNoSpace = /\S/;
    return regexAllCaps.test(text) && regexNoSpace.test(text) && knuthMorrisPratt(text, "ACGT");
}
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dna_penyakit'
  });
  
connection.connect()

router.post("/", function(req, res) {
    
    const file = req.files.file;
    const fileName = file.name;
    const newpath = __dirname + "\\files\\";
    file.mv(`${newpath}${fileName}`, (err) => {
        if (err) {
            //
        }

      });
    var dataFromFile = fs.readFileSync(newpath+fileName, 'utf-8');
    if (checkInput(dataFromFile)){
        connection.query(`INSERT INTO penyakit (penyakit, sequence) VALUES ('${req.body['namaPenyakit']}','${dataFromFile}');`, (err, rows, fields) => {
            console.log(err);
        })
    }
    else{
        console.log("cunt");
    }
    
});

module.exports = router;