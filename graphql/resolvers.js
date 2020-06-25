const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
module.exports = {
    createUser : async function({userInput},req){
        //const email = args.userInput.email;
        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.pust({message:'Email is invalid'})
        }
        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min:5})){
            errors.push({message:'Enter longer password'})
        }
        if(errors.length > 0){
            const error = new Error('Validation failed');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({email:userInput.email})
        if(existingUser){
            const error = new Error("User exists");
            throw existingUser;
        }
        const hashedPsw = await bcrypt.hash(userInput.password,12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: userInput.password
        });
        const createdUser = await user.save();
        return {...createdUser._doc, _id:createdUser._id.toString()};
    
   },
   login: async function({email, password}) {
       const user = await User.find({email:email});
       if(!user){
           const error = new Error('User not found');
            error.code = 401;
            throw error;
       }
       const isEqual =await bcrypt.compare(password,user.password); 
       if(!isEqual){
           const error = new Error('password is incorrect');
           error.code = 401;
           throw error;
       }
       const token = jwt.sign({
           userId:user._id.toString(),
           email: email
       }, 'somesupersecret',{expiresIn:'1h'});
       return {token:token , userId: token.user._id.toString()};
   }
}