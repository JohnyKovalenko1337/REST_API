const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const app = express();
//=====================routs=================================
const feedRoutes = require('./routes/feed.js');
const authRoutes = require('./routes/auth.js');

// ================================== file storing =============================
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
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png'
    ){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

//================================= util middlewares ====================================
app.use(bodyParser.json());     //application/json
app.use(
    multer({storage:fileStorage, fileFilter:fileFilter}).single('image')
    );
app.use('/image', express.static(path.join(__dirname, 'image')));

// ======================== setting header ====================
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
})

// ============================middlewares ==================================
app.use('/feed',feedRoutes);

app.use('/auth',authRoutes);

app.use((error,req,res,next)=>{
    console.log(error);
    const status = error.statusCode || 500;
    const data = error.data;
    const message = error.message;
    res.status(status).json(
        {message:message, data:data}
    );
})

// ======================================================================================
mongoose.connect('mongodb+srv://sadJo:baran@cluster1-u8e3f.mongodb.net/rest?retryWrites=true&w=majority',
    { useUnifiedTopology: true ,useNewUrlParser: true})
.then(result=>{
    console.log("success");
    const server  = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection',(socket)=>{
        console.log('Client Conneted');
    })
})
.catch(err=>{
    console.log(err);
})
