function Blob(source, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.rawContent = source.content;
    this.size = source.size;
}

module.exports = Blob;