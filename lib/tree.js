function Tree(source, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.truncated = source.truncated;
}

module.exports = Tree;