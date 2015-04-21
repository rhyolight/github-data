var assert = require('chai').assert
  , expect = require('chai').expect
  , Commit = require('../lib/commit')
  , Tree = require('../lib/tree')
  , Blob = require('../lib/blob')
  , mockCommit = require('./mock-data/commit')
  , mockTree = require('./mock-data/tree')
  , mockNewBlob = require('./mock-data/new-blob')
  , lazyGetTreeTest = false
  ;

describe('commit object', function() {

    var blobCreated = false
      , mockClient = {
            user: 'my-organization'
          , repo: 'my-repository'
          , gitdata: {
                getTree: function(params, callback) {
                    expect(params.user).to.equal('my-organization');
                    expect(params.repo).to.equal('my-repository');
                    expect(params.sha).to.equal('fbb4439a956a45fa7a5ea52f44f8a095502e3c6b');
                    callback(null, mockTree);
                }
              , createBlob: function(params, callback) {
                    blobCreated = true;
                    callback(null, mockNewBlob);
                }
            }
        };
    var commit = new Commit(mockCommit, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(commit.sha).to.equal('a075829d6b803ce74acf407b6d19e8434f1cf653');
            expect(commit.htmlUrl).to.equal("https://github.com/numenta/experiments/commit/a075829d6b803ce74acf407b6d19e8434f1cf653");
            expect(commit.treeSha).to.equal("fbb4439a956a45fa7a5ea52f44f8a095502e3c6b");
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

    describe('when represented as a string', function() {

        it('shows commit like git log shows it', function() {
            expect(commit.toString()).to.equal(
                'commit a075829d6b803ce74acf407b6d19e8434f1cf653\n' +
                'Author: Matthew Taylor <matt@numenta.org>\n' +
                'Date:   2015-04-16T19:46:09Z\n' +
                '\n' +
                '    nothing much\n'
            );
        });

    });


    describe('when getting tree the first time', function() {

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

    describe('when getting tree the second time', function() {

        before(function() {
            commit.tree = 'dummy tree';
            lazyGetTreeTest = true;
        });

        it('lazily fetches the tree', function(done) {
            commit.getTree(function() {
                done();
            });
        });

        after(function() {
            lazyGetTreeTest = false;
            commit.tree = undefined;
        });

    });

    describe('when committing a changed blob', function() {
        var mockParentTree = {
                sha: 'parent-tree-sha'
              , objects: {
                    path: 'mock-blob-path'
                  , mode: '100644'
                  , type: 'blob'
                  , sha: 'old-blob-sha'
                }
            }
          , blob = new Blob(
                {
                    content: 'cmF3IGNvbnRlbnQ='
                  , sha: 'old-blob-sha'
                }
              , mockParentTree
              , mockClient
            );
        blob.setContents('new stuff');

        describe('in the root directory', function() {

            it('calls the API to create a new blob with the blob contents', function(done) {
                commit.commitBlob(blob, 'commit msg', function(err, newCommit, newBlob) {
                    assert.ok(blobCreated);
                    done();
                });
            });

            it('attaches the new tree as the parent of the new blob', function() {
                // Mocking out the tree
                commit.tree = {
                    update: function() {}
                };
                // TODO: Continue testing here after implementing tree.update().
            });

        });

        describe('in a subtree', function() {
        });

    });


});