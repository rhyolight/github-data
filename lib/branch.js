var Commit = require('./commit')
  , GitFile = require('./gitfile');

function Branch(source, githubClient) {
    this.gh = githubClient;
    this.ref = source.ref;
    this.sha = source.object.sha;
    this.commit = undefined;
}

Branch.prototype.getCommit = function(callback) {
    var gh = this.gh;
    if (this.commit) {
        callback(null, this.commit);
    } else {
        gh.gitdata.getCommit({
            user: gh.user
          , repo: gh.repo
          , sha: this.sha
        }, function(err, response) {
            var commit = new Commit(response, gh);
            callback(null, commit);
        });
    }
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

Branch.prototype.toString = function() {
    var out = 'sha: ' + this.sha + '\n'
            + 'ref: ' + this.ref + '\n';
    return out;
};

// This is so Node.js will use toString within console.log().
Branch.prototype.inspect = Branch.prototype.toString;

module.exports = Branch;