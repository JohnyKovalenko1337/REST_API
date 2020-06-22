const express = require('express');
const {body} = require('express-validator');
const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');

router.put('/signup',[
    body('email').isEmail().withMessage('Please input valid email').custom((value,{req})=>{
        return User.findOne({ email: value })
        .then(userDoc => {
            if (userDoc) {
            return Promise.reject('E-Mail exists already, please pick a different one.') //  async validation
            }
        })
    }),
    body('name').trim().notEmpty().isString(),
    body('password','Please enter password with only text and numbers at least 5 symbols').trim()
        .isLength({min:5}).isAlphanumeric(),
  
    ],
    authController.signup
);

module.exports = router;