const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/is-auth');
module.exports = {
    createUser: async function ({ userInput }, req) {
        //const email = args.userInput.email;
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.pust({ message: 'Email is invalid' })
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: 'Enter longer password' })
        }
        if (errors.length > 0) {
            const error = new Error('Validation failed');
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email })
        if (existingUser) {
            const error = new Error("User exists");
            throw error;
        }
        const hashedPsw = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPsw
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };

    },
    login: async function ({ email, password }) {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('password is incorrect');
            error.code = 401;
            throw error;
        }
        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
        }, 'somesupersecret', { expiresIn: '1h' });
        return { token: token, userId: user._id.toString() };
    },
    createPost: async function({ postInput }, req) {
        if (!req.isAuth) {
          const error = new Error('Not authenticated!');
          error.code = 401;
          throw error;
        }
        const errors = [];
        if (
          validator.isEmpty(postInput.title) ||
          !validator.isLength(postInput.title, { min: 5 })
        ) {
          errors.push({ message: 'Title is invalid.' });
        }
        if (
          validator.isEmpty(postInput.content) ||
          !validator.isLength(postInput.content, { min: 5 })
        ) {
          errors.push({ message: 'Content is invalid.' });
        }
        if (errors.length > 0) {
          const error = new Error('Invalid input.');
          error.data = errors;
          error.code = 422;
          throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
          const error = new Error('Invalid user.');
          error.code = 401;
          throw error;
        }
        const post = new Post({
          title: postInput.title,
          content: postInput.content,
          imageUrl: postInput.imageUrl,
          creator: user
        });
        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();
        return {
          ...createdPost._doc,
          _id: createdPost._id.toString(),
          createdAt: createdPost.createdAt.toISOString(),
          updatedAt: createdPost.updatedAt.toISOString()
        };
    },
    posts: async function(args, req) {
        if (!req.isAuth) {
          const error = new Error('Not authenticated!');
          error.code = 401;
          throw error;
        }
        const totalPosts = await Post.find().countDocuments();
        const posts = await Post.find()
          .sort({ createdAt: -1 })
          .populate('creator');
        return {
          posts: posts.map(p => {       //ovewriting id createad at and updatedAt
            return {
              ...p._doc,
              _id: p._id.toString(),    
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString()
            };
          }),
          totalPosts: totalPosts
        };
    }
}