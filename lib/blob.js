function Blob(source, parent, githubClient) {
    this.gh = githubClient;
    this.parent = parent;
    this.sha = source.sha;
    this.rawContent = source.content;
    this.size = source.size;
}

Blob.prototype.getContents = function() {
    return new Buffer(this.rawContent, 'base64').toString('utf-8');
};

module.exports = Blob;