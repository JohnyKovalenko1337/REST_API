const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const feedRoutes = require('./routes/feed.js');

const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, 'image');
    },
    filename:(req,file,cb)=>{
        cb(null, uuidv4()+ ' - ' + file.originalname);
    }
});

const fileFilter = (req,file,cb)=>{
    if(
        file.minetype === 'image/jpg' ||
        file.minetype === 'image/jpeg' ||
        file.minetype === 'image/png'
    ){
        cb(null, true);
    }
    cb(null, false);
}

app.use(bodyParser.json());     //application/json
app.use(
    multer({fileStorage:fileStorage, fileFilter:fileFilter}).single('image')
    );
app.use('/image', express.static(path.join(__dirname, 'image')));

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type','Authorization');
    next();
})

app.use('/feed',feedRoutes);

app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json(
        {message:message}
    );
})

mongoose.connect('mongodb+srv://sadJo:baran@cluster1-u8e3f.mongodb.net/rest?retryWrites=true&w=majority',
    { useUnifiedTopology: true ,useNewUrlParser: true})
.then(result=>{
    console.log("success");
    app.listen(8080);
})
.catch(err=>{
    console.log(err);
})
console.log("success");
