var assert = require('chai').assert
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
        });

    });

});