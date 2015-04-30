var Tree = require('./tree');

/**
 * A git commit object. Contains a tree.
 * @class Commit
 * @param source {Object} JSON response from API, used to build.
 * @param githubClient {Object} GitHub API Client object.
 * @constructor
 */
function Commit(source, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.htmlUrl = source.html_url;
    this.author = source.author;
    this.committer = source.committer;
    this.message = source.message;
    this.treeSha = source.tree.sha;
    this.tree = undefined;
}

/**
 * Fetches the {{#crossLink "Tree"}}{{/crossLink}} corresponding to this commit.
 * @method getTree
 * @param callback {Function} Called with (Error, {{#crossLink "Tree"}}{{/crossLink}})
 */
Commit.prototype.getTree = function(callback) {
    var me = this
      , gh = this.gh;
    if (this.tree) {
        callback(null, this.tree);
    } else {
        gh.gitdata.getTree({
            user: gh.user
            , repo: gh.repo
            , sha: this.treeSha
        }, function(err, response) {
            me.tree = new Tree(response, me, gh);
            callback(null, me.tree)
        });
    }
};

Commit.prototype.commitBlob = function(blob, message, callback) {
    // 1. Create new blob through api.
    blob.update(function(err, blobData) {
        var newBlobSha = blobData.sha;

        callback();
    });
    // 2. Given the new blob sha, walk up the chain of parents of
    //    old blob, which should be all trees up to a commit. For
    //    each parent tree:
    //     - create new tree with same tree objects except for the
    //       updated child sha, which should point to the new child
    //       object sha
    //     - check to see if current parent's parent is a tree
    //        - if tree: repeat #2 sub-tasks
    //        - if commit, proceed to #3
    // 3. Create a new commit pointing to the topmost parent tree
    //    in the parent chain.

};

/**
 * Returns string data about this commit, similar to what git log would show.
 * @method toString
 * @returns {string}
 */
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