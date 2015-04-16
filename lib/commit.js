function Commit(source, githubClient) {
    this.githubClient = githubClient;
    this.sha = source.sha;
}

module.exports = Commit;