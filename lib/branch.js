function Branch(source, githubClient) {
    this.githubClient = githubClient;
    this.ref = source.ref;
    this.sha = source.object.sha;
}

Branch.prototype.getCommit = function() {

};

module.exports = Branch;