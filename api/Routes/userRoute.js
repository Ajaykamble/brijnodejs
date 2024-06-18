const express = require('express');
const router = express.Router();
var path = require('path');
var fs = require('fs');
const printer = require('@thiagoelg/node-printer');
const { print, getPrinters, getDefaultPrinter } = require('pdf-to-printer');
const request = require('request');
const axios = require('axios');
var exec = require('child_process').exec;
const { v4: uuidv4 } = require('uuid'); // Using UUID for unique filenames

router.get('/', async (req, res, next) => {
    try {
        const phpUrl = 'http://192.168.2.11/brij/print_pos.php';
        const response = await axios.post(phpUrl, {}, {
            responseType: "stream"
        });

        // Generate a unique filename for each request
        const uniqueId = uuidv4();
        const filename = `my-report-${uniqueId}.pdf`;
        const writableStream = fs.createWriteStream(filename);
        response.data.pipe(writableStream);

        writableStream.on('finish', async () => {
            try {
                var printerList = printer.getPrinters();
                console.log(printerList);
                var data = await getDefaultPrinter();
                var cmd = `PDFtoPrinter.exe`;
                var args = [filename, data.name];

                // Spawn a new process for each print job
                const printProcess = spawn(cmd, args);

                printProcess.on('close', (code) => {
                    if (code === 0) {
                        // Successfully printed
                        return res.status(200).json({ status: 'Success' });
                    } else {
                        console.error(`Printing process exited with code ${code}`);
                        return res.status(500).json({ error: 'Printing error' });
                    }
                });

                printProcess.on('error', (error) => {
                    console.error(`Printing process error: ${error}`);
                    return res.status(500).json({ error: 'Printing error' });
                });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ error: 'Error processing print job' });
            } finally {
                // Clean up the generated PDF file
                fs.unlink(filename, (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${filename}`);
                    }
                });
            }
        });

        writableStream.on('error', (error) => {
            console.error(`Stream error: ${error}`);
            return res.status(500).json({ error: 'Error writing file' });
        });
    } catch (error) {
        console.error(`Request error: ${error}`);
        return res.status(500).json({ error: 'Error generating PDF' });
    }
});

module.exports = router;