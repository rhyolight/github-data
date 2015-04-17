var fs = require('fs')
  , assert = require('chai').assert
  , expect = require('chai').expect
  , Branch = require('../lib/branch')
  , Commit = require('../lib/commit')
  , GitFile = require('../lib/gitfile')
  , mockRefMaster = require('./mock-data/ref-master')
  , mockCommit = require('./mock-data/commit')
  , mockTree = require('./mock-data/tree')
  , mockCiTree = require('./mock-data/ci-tree')
  , mockBlob = require('./mock-data/blob')
  , mockNothingBlob = require('./mock-data/nothing-blob')
;

describe('branch object', function() {

    var mockClient = {
        user: 'my-organization'
      , repo: 'my-repository'
      , gitdata: {
            getCommit: function(params, callback) {
                expect(params.user).to.equal('my-organization');
                expect(params.repo).to.equal('my-repository');
                expect(params.sha).to.equal('a075829d6b803ce74acf407b6d19e8434f1cf653');
                callback(null, mockCommit);
            }
          , getTree: function(params, callback) {
                expect(params.sha).to.equal('fbb4439a956a45fa7a5ea52f44f8a095502e3c6b');
                callback(null, mockTree);
            }
          , getBlob: function(params, callback) {
                expect(params.sha).to.equal('e0d794006138f680793d4cb6c431e3ba381d483d');
                callback(null, mockBlob);
            }
        }
    };
    var branch = new Branch(mockRefMaster, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(branch.ref).to.equal('refs/heads/master');
            expect(branch.sha).to.equal('a075829d6b803ce74acf407b6d19e8434f1cf653');
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

    describe('when getting top-level files', function() {

        it('can get a File object with a valid path', function(done) {
            branch.getFile('README.md', function(error, file) {
                assert.notOk(error);
                expect(file).to.be.instanceOf(GitFile);
                expect(file.path).to.equal('README.md');
                expect(file.contents).to.equal(fs.readFileSync('./test/mock-data/README.md', 'utf-8'));
                done();
            });
        });

        it('returns appropriate error when path does not exist', function(done) {
            branch.getFile('noop', function(error) {
                assert.ok(error, "Calling getFile() with bad path should throw an error");
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Blob path "noop" does not exist.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(404);
                done();
            });
        });

        describe('when getting multiple files', function() {
            // TODO: Come back to this after getting low-level blog retrieval working.
        });

    });

    describe('when getting lower-level files', function() {

        var mockClient = {
            user: 'my-organization'
          , repo: 'my-repository'
          , gitdata: {
                getCommit: function(params, callback) {
                    expect(params.user).to.equal('my-organization');
                    expect(params.repo).to.equal('my-repository');
                    expect(params.sha).to.equal('a075829d6b803ce74acf407b6d19e8434f1cf653');
                    callback(null, mockCommit);
                }
                , getTree: function(params, callback) {
                    console.log(params);
                    if (params.sha == 'fbb4439a956a45fa7a5ea52f44f8a095502e3c6b') {
                        callback(null, mockTree);
                    } else if (params.sha == '431de928076fd464812364c158dd8cb8347d5710') {
                        callback(null, mockCiTree);
                    }
                }
                , getBlob: function(params, callback) {
                    expect(params.sha).to.equal('30f21dd6e547530a30543f0c40089f102b8afe0d');
                    callback(null, mockNothingBlob);
                }
            }
        };
        var branch = new Branch(mockRefMaster, mockClient);

        it('can get a File object with a valid path', function(done) {
            branch.getFile('ci/nothing.txt', function(error, file) {
                assert.notOk(error);
                expect(file).to.be.instanceOf(GitFile);
                expect(file.path).to.equal('ci/nothing.txt');
                expect(file.contents).to.equal(fs.readFileSync('./test/mock-data/nothing.txt', 'utf-8'));
                done();
            });
        });

        it('returns appropriate error when path does not exist', function(done) {
            branch.getFile('ci/noop', function(error) {
                assert.ok(error, "Calling getFile() with bad path should throw an error");
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Blob path "noop" does not exist.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(404);
                done();
            });
        });

        describe('when getting multiple files', function() {
            // TODO: Come back to this after getting low-level blog retrieval working.
        });

    });

});