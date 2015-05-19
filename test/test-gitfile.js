var expect = require('chai').expect
  , assert = require('chai').assert
  , GitFile = require('../lib/gitfile')
  ;

describe('gitfile object', function() {

    describe('when constructed', function() {

        var path = 'path'
          , mockBlob = {
                toString: function() {
                    return 'blob.toString()\n'
                }
            }
          , mockTree = {
                toString: function() {
                    return 'tree.toString()\n'
                }
            }
          , mockCommit = {
                toString: function() {
                    return 'commit.toString()\n'
                }
            }
          , gitfile = new GitFile(path, mockBlob, mockTree, mockCommit);

        it('makes essential properties accessible', function() {
            expect(gitfile.path).to.equal(path);
            expect(gitfile.blob).to.equal(mockBlob);
            expect(gitfile.tree).to.equal(mockTree);
            expect(gitfile._commit).to.equal(mockCommit);
        });

        it('presents itself nicely as a string', function() {
            var expected = 'GitFile for file at "path"\n' +
                'Blob:\n' +
                'blob.toString()\n' +
                'Tree:\n' +
                'tree.toString()\n' +
                'Commit:\n' +
                'commit.toString()\n';
            expect(gitfile.toString()).to.equal(expected);
        });

    });

    describe('with low-level file path', function() {

        describe('when committing a blob', function() {
            var blobUpdated = false
              , blobSet = false
              , treeUpdated = false
              , commitTreeCalled = false
              , path = 'path'
              , mockNewBlobData = {
                    sha: 'new blob sha'
                }
              , mockNewTree = {}
              , mockBlob = {
                    update: function(callback) {
                        blobUpdated = true;
                        callback(null, mockNewBlobData);
                    }
                }
              , mockTree = {
                    setBlob: function(path, sha) {
                        expect(path).to.equal('path');
                        expect(sha).to.equal('new blob sha');
                        blobSet = true;
                    }
                  , update: function(callback) {
                        treeUpdated = true;
                        callback(null, mockNewTree);
                    }
                }
              , mockNewCommit = {}
              , mockCommit = {
                    commitTree: function(tree, msg, callback) {
                        expect(tree).to.equal(mockNewTree);
                        expect(msg).to.equal('commit message');
                        commitTreeCalled = true;
                        callback(null, mockNewCommit);
                    }
                }
              , file = new GitFile(path, mockBlob, mockTree, mockCommit)
              ;

            it('plumbing objects are utilized properly', function(done) {
                file.commit('commit message', function(err, commit) {
                    assert.notOk(err);
                    assert.ok(blobUpdated);
                    assert.ok(blobSet);
                    assert.ok(treeUpdated);
                    assert.ok(commitTreeCalled);
                    expect(commit).to.equal(mockNewCommit);
                    done();
                });
            });

            it('on blob update error, reports error properly', function(done) {
                var error = new Error('blob update failure');
                mockBlob.update = function(callback) {
                    callback(error);
                };

                file.commit('commit message', function(err) {
                    expect(err).to.equal(error);
                    done();
                });
            });

            it('on tree update error, reports error properly', function(done) {
                var error = new Error('tree update failure');
                mockBlob.update = function(callback) {
                    blobUpdated = true;
                    callback(null, mockNewBlobData);
                };
                mockTree.update = function(callback) {
                    callback(error);
                };

                file.commit('commit message', function(err) {
                    expect(err).to.equal(error);
                    done();
                });
            });

        });



    });

});