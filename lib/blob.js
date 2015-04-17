function Blob(source, parent, githubClient) {
    this.gh = githubClient;
    this.parent = parent;
    this.sha = source.sha;
    this.rawContent = source.content;
    this.size = source.size;
    //console.log('created: blob %s', this.sha);
    //console.log('  my parent is %s', this.parent.sha);
}

Blob.prototype.getContents = function() {
    return new Buffer(this.rawContent, 'base64').toString('utf-8');
};

module.exports = Blob;