var Tree = require('./tree');

function Commit(source, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.htmlUrl = source.html_url;
    this.author = source.author;
    this.committer = source.committer;
    this.message = source.message;
    this.tree = source.tree;
}

Commit.prototype.getTree = function(callback) {
    var me = this
      , gh = this.gh;
    gh.gitdata.getTree({
        user: gh.user
      , repo: gh.repo
      , sha: this.tree.sha
    }, function(err, response) {
        callback(null, new Tree(response, me, gh))
    });
};



Commit.prototype.toString = function() {
    var a = this.author
      , c = this.committer
      , out = 'commit ' + this.sha + '\n'
            + 'Author: ' + a.name + ' <' + a.email + '>\n'
            + 'Date:   ' + c.date + '\n\n'
            + '    ' + this.message + '\n';
    return out;
};

// This is so Node.js will use toString within console.log().
Commit.prototype.inspect = Commit.prototype.toString;

module.exports = Commit;