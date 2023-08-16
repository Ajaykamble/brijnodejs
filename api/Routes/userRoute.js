const express = require('express');
const router = express.Router();
var path = require('path');
var fs = require('fs');
const printer = require('@thiagoelg/node-printer');
const { print, getPrinters, getDefaultPrinter } = require('pdf-to-printer');
const request = require('request');
const axios = require('axios');
var exec = require('child_process').exec;

router.get('/', async (req, res, next) => {

    const phpUrl = 'http://192.168.2.11/brij/print_pos.php';
    const response = await axios.post(phpUrl, {}, {
        responseType: "stream"
    });

    var filename = "my-report-1.pdf";
    const writableStream = fs.createWriteStream(filename);
    response.data.pipe(writableStream);
    writableStream.on('finish', async () => {

        var printerList = printer.getPrinters();
        console.log(printerList);
        var data = await getDefaultPrinter();
        var cmd = 'PDFtoPrinter.exe my-report-1.pdf "'+data["name"]+'"';

        exec(cmd, function (error, stdout, stderr) {
            // command output is in stdout
            return res.status(200).json({"S":"D"});
        });
    
    });
    
    //PDFtoPrinter my-report-1.pdf "Microsoft Print to PDF"
});

module.exports = router;