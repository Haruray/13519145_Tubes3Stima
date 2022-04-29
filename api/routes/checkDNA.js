var express = require("express");
const mysql = require('mysql');
var router = express.Router();

var FileReader = require('filereader');
const fs = require('fs');
const { rejects } = require("assert");
const { resolve } = require("path");

function buildPatternTable(pattern) {
    var len = 0;
    var m = pattern.length;
    var patternTable=[0];
    var i = 1;
 
    while (i < m){
        if (pattern[i] == pattern[len]){
            len++;
            patternTable[i] = len
            i++;
        }
        else{
            if (len != 0){
                len = patternTable[len-1]
            }
             else{
                patternTable[i] = 0
                i++;
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
                j = patternTable[j-1]
            }
            else{
                i++;
            }
        }
    }
    return false;
}

function checkInput(text){
    var regexAllCaps = /^[A-Z]*$/;
    var regexNoSpace = /\S/;
    return regexAllCaps.test(text) && regexNoSpace.test(text) && knuthMorrisPratt(text, "ACGT");
}
function checkPenyakit(nama ,penyakit,dna, connection){
    const promise = new Promise((resolve, reject)=>{
        connection.query(`SELECT * FROM penyakit WHERE penyakit='${penyakit}'`, (err, rows, fields) => {
            if (!err){
                var tes = nama+" - "+penyakit+" - "+knuthMorrisPratt(dna,rows[0].sequence);
                resolve(true);
            }
            resolve(false);
        });
    });
    return promise
    
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
        connection.query(`INSERT INTO pengguna (nama, sequence) VALUES ('${req.body['namaPasien']}','${dataFromFile}');`, (err, rows, fields) => {
            if (!err){
                //
            }
            console.log(err);
        });
        var info = req.body['namaPasien'] + " - "+req.body['namaPenyakit'] + " - "+checkPenyakit(req.body['namaPasien'], req.body['namaPenyakit'], dataFromFile, connection).then(function(result) {return result;});
        //console.log(info);
        res.send(info);
        
    }
    else{
        console.log("cunt");
    }
    
});

module.exports = router;