function Blob(source, parent, githubClient) {
    this.gh = githubClient;
    this.parent = parent;
    this.sha = source.sha;
    this.rawContent = source.content;
    this.size = source.size;
    this.contents = new Buffer(this.rawContent, 'base64').toString('utf-8');
}

Blob.prototype.getContents = function() {
    return this.contents
};

Blob.prototype.setContents = function(contents) {
    this.contents = contents;
};

Blob.prototype.hasChangedContents = function() {
    var originalContents = new Buffer(this.rawContent, 'base64').toString('utf-8')
      , currentContents = this.getContents()
      ;
    return originalContents != currentContents;
};

Blob.prototype.update = function(callback) {
    var error
      , gh = this.gh
      ;

    if (! this.hasChangedContents()) {
        error = new Error('Blob contents have not changed.');
        error.code = 400;
        callback(error);
    } else {
        gh.gitdata.createBlob({
            user: gh.user
          , repo: gh.repo
          , content: this.getContents()
          , encoding: 'utf-8'
        }, callback);

    }
};

module.exports = Blob;