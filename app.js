var cors = require('cors');
const express=require('express');
require('express-group-routes');
const app=express();
var path = require("path");
const userRoutes = require('./api/Routes/userRoute');
const corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  };

  app.options('*', cors())
app.use(cors(corsOptions));

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if(req.method==="OPTIONS"){
        res.header("Access-Control-Allow-Methods","PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.group("/api/v1", (router) => {
    router.use('/user', userRoutes);
    //PDFtoPrinter my-report-1.pdf "Microsoft Print to PDF"
});
///admin

module.exports=app;