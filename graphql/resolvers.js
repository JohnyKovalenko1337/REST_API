const User = require('../models/user');
const bcrypt = require('bcryptjs');
const validator = require('validator');
module.exports = {
    createUser : async function({userInput},req){
        //const email = args.userInput.email;
        const errors = [];
        if(!validator.isEmail(userInput.email)){
            errors.pust({message:'Email is invalid'})
        }
        if(!validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min:5})){
            errors.push({message:'Enter longer password'})
        }
        if(!errors.isEmpty()){
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
    
   }
}