var assert = require('chai').assert
  , expect = require('chai').expect
  , Commit = require('../lib/commit')
  , mockCommit = require('./mock-data/commit')
  ;

describe('commit object', function() {

    var mockClient = {
        user: 'my-organization'
        , repo: 'my-repository'
        , gitdata: {
            //getCommit: function(params, callback) {
            //    expect(params.user).to.equal('my-organization');
            //    expect(params.repo).to.equal('my-repository');
            //}
        }
    };
    var commit = new Commit(mockCommit, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(commit.sha).to.be.equal('6b8cd6ed85a41d407787090c74a76efb981d13e0');
        });

    });

    it('can getTree()', function() {
        //expect(branch).to.have.property('getCommit');
        //expect(branch.getCommit).to.be.instanceOf(Function);
        //
        //branch.getCommit(function(err, commit) {
        //    assert.notOk(err);
        //    expect(commit).to.be.instanceOf(Commit);
        //    expect(commit).to.have.property('getTree');
        //    done();
        //
        //});
    });

});