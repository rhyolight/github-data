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
                expect(params.sha).to.equal('fbb4439a956a45fa7a5ea52f44f8a095502e3c6b');
                callback(null, mockTree);
            }
        }
    };
    var commit = new Commit(mockCommit, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(commit.sha).to.equal('a075829d6b803ce74acf407b6d19e8434f1cf653');
            expect(commit.htmlUrl).to.equal("https://github.com/numenta/experiments/commit/a075829d6b803ce74acf407b6d19e8434f1cf653");
            expect(commit.tree).to.deep.equal({
                sha: "fbb4439a956a45fa7a5ea52f44f8a095502e3c6b",
                url: "https://api.github.com/repos/numenta/experiments/git/trees/fbb4439a956a45fa7a5ea52f44f8a095502e3c6b"
            });
            expect(commit.author).to.deep.equal({
                name: "Matthew Taylor",
                email: "matt@numenta.org",
                date: "2015-04-16T19:46:09Z"
            });
            expect(commit.committer).to.deep.equal({
                name: "Matthew Taylor",
                email: "matt@numenta.org",
                date: "2015-04-16T19:46:09Z"
            });
            expect(commit.message).to.equal("nothing much");
        });

    });

    describe('when getting tree', function() {

        it('returns a Tree object', function(done) {
            expect(commit).to.have.property('getTree');
            expect(commit.getTree).to.be.instanceOf(Function);

            commit.getTree(function(err, tree) {
                assert.notOk(err);
                expect(tree).to.be.instanceOf(Tree);
                done();
            });
        });

    });


});