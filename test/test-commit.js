var assert = require('chai').assert
  , expect = require('chai').expect
  , Commit = require('../lib/commit')
  , Tree = require('../lib/tree')
  , mockCommit = require('./mock-data/commit')
  , mockTree = require('./mock-data/tree')
  ;

describe('commit object', function() {

    var mockClient = {
        user: 'my-organization'
      , repo: 'my-repository'
      , gitdata: {
            getTree: function(params, callback) {
                expect(params.user).to.equal('my-organization');
                expect(params.repo).to.equal('my-repository');
                expect(params.sha).to.equal('4fa45ccb8b07608663be1af7700432125505d0ec');
                callback(null, mockTree);
            }
        }
    };
    var commit = new Commit(mockCommit, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(commit.sha).to.equal('6b8cd6ed85a41d407787090c74a76efb981d13e0');
            expect(commit.htmlUrl).to.equal("https://github.com/rhyolight/sprinter.js/commit/6b8cd6ed85a41d407787090c74a76efb981d13e0");
            expect(commit.tree).to.deep.equal({
                sha: "4fa45ccb8b07608663be1af7700432125505d0ec",
                url: "https://api.github.com/repos/rhyolight/sprinter.js/git/trees/4fa45ccb8b07608663be1af7700432125505d0ec"
            });
            expect(commit.author).to.deep.equal({
                name: "Matthew Taylor",
                email: "matt@numenta.org",
                date: "2015-04-03T20:23:56Z"
            });
            expect(commit.committer).to.deep.equal({
                name: "Matthew Taylor",
                email: "matt@numenta.org",
                date: "2015-04-03T20:23:56Z"
            });
            expect(commit.message).to.equal("Merge pull request #42 from rhyolight/add-deeper-pr-data Adding \"mergeIssueProperties\" option");
        });

    });

    describe('when getting tree', function() {

        it('returns a Tree object', function(done) {
            expect(commit).to.have.property('getTree');
            expect(commit.getTree).to.be.instanceOf(Function);

            commit.getTree(function(err, commit) {
                assert.notOk(err);
                expect(commit).to.be.instanceOf(Tree);
                done();
            });
        });

    });


});