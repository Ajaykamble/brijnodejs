var buffer = require('buffer');
var path = require('path');
var fs = require('fs');
const http = require('http');
const printer = require('@thiagoelg/node-printer');
const { print, getPrinters, getDefaultPrinter } = require('pdf-to-printer');
const request = require('request');
var { spawn } = require('child_process');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid'); // Using UUID for unique filenames

let printQueue = [];
let isPrinting = false;

module.exports = function (io) {
    console.log("CA");
    io.sockets.on('connection', function (socket) {
        console.log("Connected", socket.id);
        socket.on('sendMessage', function (mes) {
            console.log("Connected", mes);
            //2024-06-02 11:31:36*23*Restaurant*KOT*Fastfood
            const myArray = mes.split("*");
            if (myArray.length >= 5) {
                var date = myArray[0];
                var invoiceId = myArray[1];
                var printTo = myArray[2];
                var pType = myArray[3];
                var sendPrint = myArray[4];

                var phpUrl = "";
                if (pType == "KOT") {
                    phpUrl = encodeURI('http://192.168.0.60/brij/print_pos.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint);
                } else if (pType == "KOTDEL") {
                    phpUrl = encodeURI('http://192.168.0.60/brij/print_pos_del.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint + '&rowno=' + date);
                } else if (pType == "PrintDS") {
                    phpUrl = encodeURI('http://192.168.0.60/brij/printdetsalesummary.php?a=' + date + '&b=' + invoiceId);
                } else {
                    if (sendPrint == "Restaurant") {
                        phpUrl = encodeURI('http://192.168.0.60/brij/print_pos_rest.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint);
                    } else {
                        phpUrl = encodeURI('http://192.168.0.60/brij/print_pos_fast_bill.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint);
                    }
                }
                console.log("Connected", phpUrl);

                // Add the print job to the queue
                printQueue.push({ phpUrl, pType, sendPrint });
                processQueue();
            }
        });
    });
};

async function processQueue() {
    if (isPrinting || printQueue.length === 0) {
        return;
    }

    isPrinting = true;
    const { phpUrl, pType, sendPrint } = printQueue.shift();
    
    try {
        const response = await axios.post(phpUrl, {}, {
            responseType: "stream"
        });
        const formattedDate = new Date().toISOString().replace(/[-:.T]/g, '');
        var filename = `invoice_${formattedDate}_${uuidv4()}.pdf`;
        const writableStream = fs.createWriteStream(filename);
        response.data.pipe(writableStream);
        writableStream.on('finish', async () => {
            var printerName = "";
            if (pType == "KOT" || pType == "KOTDEL") {
                if (sendPrint == "Restaurant") {
                    printerName = "RESTKITCHEN";
                } else {
                    printerName = "FASTFOOD";
                }
            } else if (pType == "PrintDS") {
                printerName = "CHAI";
            } else {
                if (sendPrint == "Restaurant") {
                    printerName = "RESTPOS";
                } else {
                    printerName = "POSFASTFOOD";
                }
            }
            var cmd = 'PDFtoPrinter.exe';
            var args = [filename, printerName];
            console.log(`${cmd} ${args.join(' ')}`);
            
            const child = spawn(cmd, args);
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`Printed ${filename} successfully`);
                    fs.unlink(filename, (err) => {
                        if (err) {
                            console.error(`Error deleting file: ${err}`);
                        } else {
                            console.log(`Deleted file: ${filename}`);
                        }
                    });
                } else {
                    console.error(`Printing failed with code ${code}`);
                }
                isPrinting = false;
                processQueue();
            });
        });
    } catch (error) {
        console.error(`Error processing print job: ${error}`);
        isPrinting = false;
        processQueue();
    }
}
