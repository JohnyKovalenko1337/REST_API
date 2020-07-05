const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');
const io = require('../socket');

const User = require('../models/user');
const Post = require('../models/post');
const FeedController = require('../controllers/feed');


describe('Feed Controller', function () {
    before(function (done) {
        mongoose.connect('mongodb+srv://sadJo:baran@cluster1-u8e3f.mongodb.net/test-rest?retryWrites=true&w=majority',
            { useUnifiedTopology: true, useNewUrlParser: true })
            .then(() => {
                const user = new User({
                    email: "asd@dasd.caws",
                    password: "zxczxc",
                    name: "jojojo",
                    posts: [],
                    _id: '5c0f66b979af55031b34728a'
                });
                return user.save();
            })
            .then((result) => {
                done();
            })
    });
    it('should add a created post to the posts of the creator', async function () {

        const req = {
            body: {
                title: "tofl",
                content: "very good rofl",

            },
            file: {
                path: 'abddfss'
            },
            userId: '5c0f66b979af55031b34728a'
        }

        const res = {
            status: function () {
                return this;
            },
            json: function () { }
        };

        const stub = sinon.stub(io, 'getIO').callsFake(() => {
            return {
              emit: function() {}
            }
          });
         
        await FeedController.createPost(req, res, () => {})
              .then((savedUser) => {
                expect(savedUser).to.have.property('posts');
                expect(savedUser.posts).to.have.length(1);
                stub.restore();
                
              });
    })

    after(function (done) {
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            })
    })
})