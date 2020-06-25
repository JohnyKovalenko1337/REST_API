const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');

const app = express();

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
    if(req.method === "OPTIONS"){
        return res.sendStatus(200);
    }
    next();
})

// ============================middlewares ==================================
app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err){
        if(!err.originalError){
            return err;
        }
        const data = err.originalError.data;
        const code = err.originalError.code;
        const message = err.message || 'error';
        return {message: message, status: code, data: data}
    }
}))


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
    app.listen(8080);
})
.catch(err=>{
    console.log(err);
})
