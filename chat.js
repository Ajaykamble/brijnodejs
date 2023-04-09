
var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
const http = require('http');
const printer = require('@thiagoelg/node-printer');
const request = require('request');
const axios = require('axios');

module.exports = function (io) {
    console.log("CA");
    io.sockets.on('connection', function (socket) {
        console.log("Connected", socket.id);
        socket.on('sendMessage', async function (mes) {
            console.log("Connected", mes);
            const phpUrl = 'http://localhost/brij/print_pos.php';
            const response = await axios.post(phpUrl, {}, {
                responseType: "stream"
            });
            var filename = "my-report-1.pdf";
            response.data.pipe(fs.createWriteStream(filename));
            var printerList = printer.getPrinters();
            printer.printDirect({
                data: fs.readFileSync(filename),
                success: function (jobID) {
                    console.log("sent to printer with ID: " + jobID);
                },
                error: function (err) {
                    console.log(err);
                }
            });
        });
    });
};

