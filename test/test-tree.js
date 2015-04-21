var _ = require('lodash')
  , assert = require('chai').assert
  , expect = require('chai').expect
  , Tree = require('../lib/tree')
  , Blob = require('../lib/blob')
  , mockTree = require('./mock-data/tree')
  , mockCiTree = require('./mock-data/ci-tree')
  , mockBlob = require('./mock-data/blob')
  , mockNewBlob = require('./mock-data/new-blob')
  ;

describe('tree object', function() {

    var mockClient = {
        user: 'my-organization'
      , repo: 'my-repository'
      , gitdata: {
                getTree: function(params, callback) {
                    expect(params.user).to.equal('my-organization');
                    expect(params.repo).to.equal('my-repository');
                    expect(params.sha).to.equal('431de928076fd464812364c158dd8cb8347d5710');
                    callback(null, mockCiTree);
                }
              , getBlob: function(params, callback) {
                    expect(params.user).to.equal('my-organization');
                    expect(params.repo).to.equal('my-repository');
                    expect(params.sha).to.equal('e0d794006138f680793d4cb6c431e3ba381d483d');
                    callback(null, mockBlob);
                }
            }
        }
      , mockParent = {};

    var tree = new Tree(mockTree, mockParent, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(tree.sha).to.equal('fbb4439a956a45fa7a5ea52f44f8a095502e3c6b');
            expect(tree.parent).to.equal(mockParent);
            assert.notOk(tree.truncated);
        });


    });

    describe('when inspecting object types', function() {
        var tree = new Tree(mockTree, mockParent, mockClient);

        it('knows a tree path', function() {
            assert.ok(tree.isTree('ci'));
        });

        it('knows a blob path', function() {
            assert.ok(tree.isBlob('README.md'));
        });

        it('knows that bad paths are neither trees nor blobs', function() {
            assert.notOk(tree.isTree('noop'));
            assert.notOk(tree.isBlob('noop'));
        });

        it('reports whether objects have been changed', function() {
            expect(tree.hasChanged()).to.equal(false);
            tree.objects[0].sha = 'updated-sha';
            expect(tree.hasChanged()).to.equal(true);
        });

    });

    describe('when represented as a string', function() {

        it('lists tree object paths, types, and sizes', function() {
            expect(tree.toString()).to.equal(
                'tree fbb4439a956a45fa7a5ea52f44f8a095502e3c6b:\n' +
                '- blob 2e36040ea364f028b7a2b310fdb95e240470a84b .travis.yml (705)\n' +
                '- blob 689de6464e4018de0598df11c7eae058f5c3d3ff CHANGELOG.md (62)\n' +
                '- blob e0d794006138f680793d4cb6c431e3ba381d483d README.md (162)\n' +
                '- tree 431de928076fd464812364c158dd8cb8347d5710 ci\n' +
                '- blob 9d6834b006e825e9840c4ca184997edbf2cb3a30 nupic_sha.txt (41)\n' +
                '- blob 065e4e5c2996a8e224573abba5656e360e085621 open-pr.sh (376)\n' +
                '- blob c59cf00bca2e47c5b63ba6b20a03f63cc97cfc5d temp.txt (22)\n'
            );
        });

    });

    describe('when getting subtree', function() {

        it('returns proper error when bad tree path', function(done) {
            tree.getTree('noop', function(error) {
                assert.ok(error, "Nonexistant tree path should throw error");
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Tree path "noop" does not exist.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(404);
                done();
            });
        });

        it('returns proper error when tree path points to blob', function(done) {
            tree.getTree('README.md', function(error) {
                assert.ok(error, "Calling getTree() with path to blob should throw an error");
                expect(error).to.be.instanceOf(TypeError);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Specified tree path "README.md" is not a tree, it is a blob.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(400);
                done();
            });
        });

        it('returns a Tree object with a pointer to parent tree', function(done) {
            tree.getTree('ci', function(err, childTree) {
                assert.notOk(err);
                expect(childTree).to.be.instanceOf(Tree);
                expect(childTree.parent).to.equal(tree);
                expect(childTree.sha).to.equal('431de928076fd464812364c158dd8cb8347d5710');
                assert.notOk(childTree.truncated);
                done();
            });
        });

    });


    describe('when getting a first-level blob', function() {

        it('returns proper error when bad blob path', function(done) {
            tree.getBlob('noop', function(error) {
                assert.ok(error, "Nonexistant blob path should throw error");
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Blob path "noop" does not exist.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(404);
                done();
            });
        });

        it('returns proper error when blob path points to tree', function(done) {
            tree.getBlob('ci', function(error) {
                assert.ok(error, "Calling getBlob() with path to tree should throw an error");
                expect(error).to.be.instanceOf(TypeError);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Specified blob path "ci" is not a blob, it is a tree.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(400);
                done();
            });
        });

        it('returns a Blob object with a pointer to the parent tree', function(done) {
            tree.getBlob('README.md', function(err, blob) {
                assert.notOk(err);
                expect(blob).to.be.instanceOf(Blob);
                expect(blob.parent).to.equal(tree);
                done();
            });
        });

    });

    describe('when getting a lower-level blob', function() {

        var mockClient = {
                user: 'my-organization'
              , repo: 'my-repository'
              , gitdata: {
                    getTree: function(params, callback) {
                        expect(params.user).to.equal('my-organization');
                        expect(params.repo).to.equal('my-repository');
                        expect(params.sha).to.equal('431de928076fd464812364c158dd8cb8347d5710');
                        callback(null, mockCiTree);
                    }
                  , getBlob: function(params, callback) {
                        expect(params.user).to.equal('my-organization');
                        expect(params.repo).to.equal('my-repository');
                        expect(params.sha).to.equal('30f21dd6e547530a30543f0c40089f102b8afe0d');
                        callback(null, mockBlob);
                    }
                  , createBlob: function(params, callback) {
                        callback(null, mockNewBlob);
                    }
                }
            }
          , mockParent = {};

        var tree = new Tree(mockTree, mockParent, mockClient);

        it('returns proper error when bad blob path subdir', function(done) {
            tree.getBlob('ci/noop', function(error) {
                assert.ok(error, "Nonexistant blob path should throw error");
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Blob path "ci/noop" does not exist.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(404);
                done();
            });
        });

        it('returns proper error when bad blob path top dir', function(done) {
            tree.getBlob('noop/ci', function(error) {
                assert.ok(error, "Nonexistant blob path should throw error");
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Tree path "noop" does not exist.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(404);
                done();
            });
        });

        it('returns proper error when blob path points to tree', function(done) {
            tree.getBlob('ci/travis', function(error) {
                assert.ok(error, "Calling getBlob() with path to tree should throw an error");
                expect(error).to.be.instanceOf(TypeError);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Specified blob path "ci/travis" is not a blob, it is a tree.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(400);
                done();
            });
        });

        it('returns a Blob object with a pointer to the parent tree', function(done) {
            tree.getBlob('ci/nothing.txt', function(err, blob) {
                assert.notOk(err);
                expect(blob).to.be.instanceOf(Blob);
                expect(blob.parent.sha).to.equal('431de928076fd464812364c158dd8cb8347d5710');
                done();
            });
        });

    });

    /*
     * I started updating a blob from the Tree object here, but I think it works
     * better to do it all from the Commit, so I commented it out to continue
     * from the Commit object.
     */

    //describe('when updating a blog', function() {
    //
    //    var mockBlob = new Blob({
    //        sha: 'mock blob sha'
    //      , content: 'Zm9vIGJhcg==' // base64 for "foo bar"
    //    }, 'parent', {
    //        gitdata: {
    //            createBlob: function(params, callback) {
    //                callback(null, {
    //                    url: "updated blob url"
    //                  , sha: "updated blob sha"
    //                });
    //            }
    //        }
    //    });
    //    // So it doesn't throw an error when updating.
    //    mockBlob.setContents("bar foo");
    //
    //    it('creates a new Blob object with the blob data result and sets itself as parent', function(done) {
    //        tree.createBlob(mockBlob, function(error, newBlob) {
    //            assert.notOk(error);
    //            expect(newBlob).to.be.instanceOf(Blob);
    //            expect(newBlob.parent).to.equal(tree);
    //            expect(newBlob.contents).to.equal('bar foo');
    //            expect(newBlob.sha).to.equal('updated blob sha');
    //            done()
    //        });
    //    });
    //
    //    it('throws appropriate error when updating blob with unchanged content', function(done) {
    //        mockBlob.setContents("foo bar");
    //        tree.createBlob(mockBlob, function(error) {
    //            assert.ok(error, "Calling createBlob() with an unchanged blob should throw an error");
    //            expect(error).to.be.instanceOf(Error);
    //            expect(error).to.have.property('message');
    //            expect(error.message).to.equal('Blob contents have not changed.');
    //            expect(error).to.have.property('code');
    //            expect(error.code).to.equal(400);
    //            done();
    //        });
    //    });
    //
    //});

});