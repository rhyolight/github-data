var assert = require('chai').assert
  , expect = require('chai').expect
  //, proxyquire = require('proxyquire')
  , Branch = require('../lib/branch')
  , Commit = require('../lib/commit')
  , mockRefMaster = require('./mock-data/ref-master')
  , mockCommit = require('./mock-data/commit')
;

describe('branch object', function() {

    var mockClient = {
        user: 'my-organization'
      , repo: 'my-repository'
      , gitdata: {
            getCommit: function(params, callback) {
                expect(params.user).to.equal('my-organization');
                expect(params.repo).to.equal('my-repository');
                expect(params.sha).to.equal('6b8cd6ed85a41d407787090c74a76efb981d13e0');
                callback(null, mockCommit);
            }
        }
    };
    var branch = new Branch(mockRefMaster, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(branch.ref).to.equal('refs/heads/master');
            expect(branch.sha).to.equal('6b8cd6ed85a41d407787090c74a76efb981d13e0');
        });

    });

    describe('when getting commit', function() {

        it('returns a Commit object', function(done) {
            expect(branch).to.have.property('getCommit');
            expect(branch.getCommit).to.be.instanceOf(Function);

            branch.getCommit(function(err, commit) {
                assert.notOk(err);
                expect(commit).to.be.instanceOf(Commit);
                done();
            });
        });

    });

});