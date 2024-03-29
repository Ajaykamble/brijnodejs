
var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
const http = require('http');
const printer = require('@thiagoelg/node-printer');
const { print, getPrinters, getDefaultPrinter } = require('pdf-to-printer');
const request = require('request');
var exec = require('child_process').exec;
const axios = require('axios');

module.exports = function (io) {
    console.log("CA");
    io.sockets.on('connection', function (socket) {
        console.log("Connected", socket.id);
        socket.on('sendMessage', async function (mes) {
            console.log("Connected", mes);
            const phpUrl = 'http://192.168.2.11/brij/print_pos.php';
            const response = await axios.post(phpUrl, {}, {
                responseType: "stream"
            });

            var filename = "my-report-1.pdf";
            const writableStream = fs.createWriteStream(filename);
            response.data.pipe(writableStream);
            writableStream.on('finish', async () => {

                var cmd = 'PDFtoPrinter.exe my-report-1.pdf "' + data["name"] + '"';

                exec(cmd, function (error, stdout, stderr) {
                    // command output is in stdout
                });
            });

        });
    });
};

