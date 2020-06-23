const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req,res,next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
        
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    bcrypt.hash(password,12)
    .then(hashedPw=>{
        const user = new User({
            name: name,
            email: email,
            password: hashedPw
        });
        return user.save()
    })
    .then(result=>{
        res.status(201).json({message:"successfuly added new user",userId: result._id})
    })
    .catch(err=>{
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    });
}

exports.login = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email:email})
    .then(user=>{
        if(!user){
            const error = new Error('Couldnt be found');
            error.statusCode = 401;
            throw error;    
        }
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    })
    .then((isEqual)=>{
        if(!isEqual){
            const error = new Error('Password is wrong');
            error.statusCode = 401;
            throw error; 
        }
        const token = jwt.sign(
            {
                email: loadedUser.email, userId: loadedUser._id.toString()
            },
            'somesupersecret',
            {
                expiresIn: '1h'
            });
        res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        })
    })
    .catch(err=>{
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    });
}

exports.getStatus = (req,res,next)=>{
    const userId = req.userId;
    User.findById(userId)
    .then(user=>{
      res.status(200).json({message:'Succesed loadding', status:user.status})
    })
    .catch(err=>{
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
  }
  
  exports.putStatus = (req,res,next)=>{
    const status = req.body.status;
    const userId = req.userId;
    User.findById(userId)
    .then(user=>{
      user.status = status;
      return user.save();
    })
    .then(result=>{
      res.status(200).json({message:'Succesed adding a status'})
    })
    .catch(err=>{
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    })
  }