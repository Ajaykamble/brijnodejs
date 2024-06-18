
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
            //2024-06-02 11:31:36*23*Restaurant*KOT*Fastfood
            const myArray = mes.split("*");
            if (myArray.length >= 5) {
                var date = myArray[0];
                var invoiceId = myArray[1];
                var printTo = myArray[2];
                var pType = myArray[3];
                var sendPrint = myArray[4];
/*
Connected 2024-03-19 18:43:26*24*Restaurant*KOT*Restaurant
Connected http://192.168.0.60/brij/print_pos.php?id=24&type=Restaurant&main=Restaurant
PDFtoPrinter.exe invoice_20240319131329758Z.pdf "RESTKITCHEN"
Connected 2024-03-19 18:43:26*24*Restaurant*KOT*Fastfood
Connected http://192.168.0.60/brij/print_pos.php?id=24&type=Restaurant&main=Fastfood
PDFtoPrinter.exe invoice_20240319131329852Z.pdf "FASTFOOD"
*/
//console.log("Connected", sendPrint + "Hello Rupesh");
                //const phpUrl = 'http://192.168.0.60/brij/print_pos.php?id='+invoiceId+'&type='+printTo;
                var phpUrl = "";
                if (pType == "KOT") {
                    phpUrl = encodeURI('http://192.168.0.60/brij/print_pos.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint);
                }
                else if (pType == "KOTDEL") {
                    phpUrl = encodeURI('http://192.168.0.60/brij/print_pos_del.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint + '&rowno=' + date);
                }
                else if (pType == "PrintDS") {
                    phpUrl = encodeURI('http://192.168.0.60/brij/printdetsalesummary.php?a=' + date + '&b=' + invoiceId);
                }
                else {
                    if (sendPrint == "Restaurant") {
                        phpUrl = encodeURI('http://192.168.0.60/brij/print_pos_rest.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint);
                
                    }
                    else
                    {
                        phpUrl = encodeURI('http://192.168.0.60/brij/print_pos_fast_bill.php?id=' + invoiceId + '&type=' + printTo + '&main=' + sendPrint);
                    }
                    
                }
                console.log("Connected", phpUrl);
                const response = await axios.post(phpUrl, {}, {
                    responseType: "stream"
                });
                const formattedDate = new Date().toISOString().replace(/[-:.T]/g, '');

                var filename = "invoice_" + formattedDate + ".pdf";
                const writableStream = fs.createWriteStream(filename);
                response.data.pipe(writableStream);
                console.log(sendPrint);
                writableStream.on('finish', async () => {
                    var printerName = "";
                    if (pType == "KOT" || pType == "KOTDEL") 
                    {
                        if (sendPrint == "Restaurant") {
                            //printerName = "CHAI"; 
                            printerName  = "RESTKITCHEN"; 
                             //printerName  = "RESTPOS";
                             //printerName  = "MOTELPOS";
                             //printerName = "FASTFOOD"; 
                            // printerName = "POSFASTFOOD"; 
                        }
                        else {
                           // printerName = "CHAI"; 
                            printerName = "FASTFOOD"; 
                          //printerName  = "RESTPOS";
                        }
                    }
                    else if (pType == "PrintDS") 
                        {
                            if (sendPrint == "Restaurant") {

                               //printerName  = "RESTKITCHEN"; 
                                 //printerName  = "RESTPOS";
                                 //printerName  = "MOTELPOS";
                                 //printerName = "FASTFOOD"; 
                                 printerName = "CHAI"; 
                            }
                            else {
                                //printerName = "FASTFOOD"; 
                              //printerName  = "RESTPOS";
                              printerName = "CHAI"; 
                            }
                        }
                    else
                    {
                        if (sendPrint == "Restaurant") {
                           // printerName = "CHAI"; 
                            printerName = "RESTPOS";
                        }
                        else {
                           // printerName = "CHAI"; 
                            
                            printerName = "POSFASTFOOD"; 
                        }
                    }
                    var cmd = 'PDFtoPrinter.exe ' + filename + ' "' + printerName + '"';
                    console.log(cmd);
                    exec(cmd, function (error, stdout, stderr) {
                        // command output is in stdout

                    });
                });
            }


        });
    });
};

