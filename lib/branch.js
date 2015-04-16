var Commit = require('./commit');

function Branch(source, githubClient) {
    this.gh = githubClient;
    this.ref = source.ref;
    this.sha = source.object.sha;
}

Branch.prototype.getCommit = function(callback) {
    var gh = this.gh;
    gh.gitdata.getCommit({
        user: gh.user
      , repo: gh.repo
      , sha: this.sha
    }, function(err, response) {
        callback(null, new Commit(response, gh))
    });
};

module.exports = Branch;