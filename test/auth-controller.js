const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');
const { deleteOne } = require('../models/user');

describe('Auth Controller - Login', function () {
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
    it('should throw an error with code 500 if access to db failes', async function () {
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: "body@test.com",
                password: "zxczxc"
            }
        }

        await AuthController.login(req, {}, () => { })
            .then((result) => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 500);
                //done();                     //tells mocha to wait for this promise
            })
            .catch(err => {
                console.log(err);
            })

        User.findOne.restore();
    })
    it('should give responce with valid user status for an existing user', function (done) {

        const req = {
            userId: "5c0f66b979af55031b34728a"
        }
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.userStatus = data.status;
            }
        };

        AuthController.getStatus(req, res, () => { }).then(() => {
            expect(res.statusCode).to.be.equal(200)
            expect(res.userStatus).to.be.equal('I am new!');
            done();
        })
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