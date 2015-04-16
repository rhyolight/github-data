var assert = require('chai').assert
  , expect = require('chai').expect
  , Tree = require('../lib/tree')
  , mockTree = require('./mock-data/tree')
  ;

describe('tree object', function() {

    var mockClient = {
        user: 'my-organization'
      , repo: 'my-repository'
      , gitdata: {
            //getTree: function(params, callback) {
            //    expect(params.user).to.equal('my-organization');
            //    expect(params.repo).to.equal('my-repository');
            //    expect(params.sha).to.equal('4fa45ccb8b07608663be1af7700432125505d0ec');
            //    callback(null, mockTree);
            //}
        }
    };
    var tree = new Tree(mockTree, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(tree.sha).to.equal('4fa45ccb8b07608663be1af7700432125505d0ec');
            assert.notOk(tree.truncated)
        });

    });

    //describe('when getting tree', function() {
    //
    //    it('returns a Tree object', function(done) {
    //        expect(commit).to.have.property('getTree');
    //        expect(commit.getTree).to.be.instanceOf(Function);
    //
    //        commit.getTree(function(err, commit) {
    //            assert.notOk(err);
    //            expect(commit).to.be.instanceOf(Tree);
    //            done();
    //        });
    //    });
    //
    //});


});