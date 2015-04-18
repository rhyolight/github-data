var fs = require('fs')
  , assert = require('chai').assert
  , expect = require('chai').expect
  , Blob = require('../lib/blob')
  , mockBlob = require('./mock-data/blob')
  , mockNewBlob = require('./mock-data/new-blob')
  ;

describe('blob object', function() {

    var mockClient = {
        user: 'my-organization'
      , repo: 'my-repository'
      , gitdata: {
            getBlob: function(params, callback) {
                expect(params.user).to.equal('my-organization');
                expect(params.repo).to.equal('my-repository');
                expect(params.sha).to.equal('e0d794006138f680793d4cb6c431e3ba381d483d');
                callback(null, mockBlob);
            }
          , createBlob: function(params, callback) {
                expect(params.user).to.equal('my-organization');
                expect(params.repo).to.equal('my-repository');
                expect(params.content).to.equal('new content');
                expect(params.encoding).to.equal('utf-8');
                callback(null, mockNewBlob);
            }
        }
    };

    var blob = new Blob(mockBlob, null, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(blob.sha).to.equal('e0d794006138f680793d4cb6c431e3ba381d483d');
            expect(blob.rawContent).to.equal("ZXhwZXJpbWVudHMKPT09PT09PT09PT0KCgoKTk8KCnQyCnQzCnQ1CnQ2Cgpi YnJhbmNoCmJicmFuY2gKCmFydGlmYWN0IHRlc3RzCgoKd2hhdGV2ZXIKPT09 PT09PQptb3JlIGFuZCBtb3JlCgoKc28gdGlyZWQgb2YgdGhpcy4KCnRocmVl CmZvdXIKCgoKZml2ZQoKPT09PT09PQooNCkK ");
        });

    });

    describe('after creation', function() {

        var blob = new Blob(mockBlob, null, mockClient);

        it('allows retreival of utf-8 content', function() {
            var expectedContent = fs.readFileSync('./test/mock-data/README.md', 'utf-8')
              , content = blob.getContents();
            expect(content).to.equal(expectedContent);
        });

        it('reports whether contents have been changed', function() {
            assert.notOk(blob.hasChangedContents());
            blob.setContents('something different');
            assert.ok(blob.hasChangedContents());
        });

    });

    describe('when updating blog contents', function() {

        it('throws an error if blog contents are unchanged', function(done) {
            blob.update(function(error) {
                assert.ok(error);
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Blob contents have not changed.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(400);
                done();
            });
        });

        it('allows user to set new utf-8 contents', function() {
            blob.setContents('new contents');
            expect(blob.getContents()).to.equal('new contents');
        });

        it('creates a new blob through API on update with new contents and returns blob data', function(done) {
            blob.setContents('new content');
            blob.update(function(error, response) {
                assert.notOk(error);
                expect(response).to.deep.equal({
                    "url": "new-blob-url",
                    "sha": "new-blob-sha"
                });
                done();
            });

        });

    });

});