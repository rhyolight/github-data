var Commit = require('./commit')
  , GitFile = require('./gitfile');

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

Branch.prototype.getFile = function(path, callback) {
    this.getCommit(function(error, commit) {
        commit.getTree(function(error, tree) {
            tree.getBlob(path, function(error, blob) {
                if (error) {
                    return callback(error);
                }
                callback(null, new GitFile(path, blob, tree, commit));
            });
        });
    });
};

module.exports = Branch;