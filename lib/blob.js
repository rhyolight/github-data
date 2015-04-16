function Blob(source, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.rawContent = source.content;
    this.size = source.size;
}

Blob.prototype.getContent = function() {
    return new Buffer(this.rawContent, 'base64').toString('utf-8');
};

module.exports = Blob;