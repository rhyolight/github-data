var fs = require('fs')
  , assert = require('chai').assert
  , expect = require('chai').expect
  , Blob = require('../lib/blob')
  , mockBlob = require('./mock-data/blob')
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
        }
    };

    var blob = new Blob(mockBlob, mockClient);

    describe('when constructed', function() {

        it('makes essential properties accessible', function() {
            expect(blob.sha).to.equal('e0d794006138f680793d4cb6c431e3ba381d483d');
            expect(blob.rawContent).to.equal("ZXhwZXJpbWVudHMKPT09PT09PT09PT0KCgoKTk8KCnQyCnQzCnQ1CnQ2Cgpi YnJhbmNoCmJicmFuY2gKCmFydGlmYWN0IHRlc3RzCgoKd2hhdGV2ZXIKPT09 PT09PQptb3JlIGFuZCBtb3JlCgoKc28gdGlyZWQgb2YgdGhpcy4KCnRocmVl CmZvdXIKCgoKZml2ZQoKPT09PT09PQooNCkK ");
        });

    });

    describe('after creation', function() {

        it('allows retreival of utf-8 content', function() {
            var expectedContent = fs.readFileSync('./test/mock-data/README.md', 'utf-8')
              , content = blob.getContents();
            expect(content).to.equal(expectedContent);
        });

    });

});