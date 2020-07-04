const expect = require('chai').expect;

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function () {
    it('should throw error if no auth header is present', function () {
        const req = {
            get: function () {
                return null;
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw('Not Autenticated');
    });

    it('should throw an error if the authorization header is only one string', function () {
        const req = {
            get: function (headerName) {
                return 'zxc';
            }
        }
        expect(authMiddleware.bind(this, req, {}, () => { })).to.throw();
    })
})
