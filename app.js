var cors = require('cors');
const express=require('express');
const app=express();
var path = require("path");

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


///admin

module.exports=app;