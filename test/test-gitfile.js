var expect = require('chai').expect
  , GitFile = require('../lib/gitfile')
  ;

describe('gitfile object', function() {

    describe('when constructed', function() {

        var path = 'path'
          , mockBlob = {
                getContents: function() {
                    return 'mock contents';
                }
            }
          , mockTree = {}
          , mockCommit = {}
          , gitfile = new GitFile(path, mockBlob, mockTree, mockCommit);

        it('makes essential properties accessible', function() {
            expect(gitfile.path).to.equal(path);
            expect(gitfile.blob).to.equal(mockBlob);
            expect(gitfile.tree).to.equal(mockTree);
            expect(gitfile.commit).to.equal(mockCommit);
            expect(gitfile.contents).to.equal('mock contents');
        });

    });

});