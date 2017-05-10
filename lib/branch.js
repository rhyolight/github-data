var Commit = require('./commit')
  , GitFile = require('./gitfile');

/**
 * Represents a git "reference", but it makes more sense in the context of this
 * library to call it a branch. This constructor is not meant to be called
 * manually. It is created by the {{#crossLink "GitData"}}{{/crossLink}} object.
 * @class Branch
 * @param source {Object} JSON response from API, used to build.
 * @param githubClient {Object} GitHub API Client object.
 * @constructor
 */
function Branch(source, githubClient) {
    this.gh = githubClient;
    this.ref = source.ref;
    this.sha = source.object.sha;
    this.commit = undefined;
}

/**
 * Fetches the commit for this branch.
 * @method getCommit
 * @param callback {Function} Called with (Error, {{#crossLink "Commit"}}{{/crossLink}})
 */
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

/**
 * Pushes a commit to this branch. Actually, it updates the reference object
 * this branch represents to point to the commit SHA of the given commit. Once
 * it successfully calls the API to do so, it updates its own SHA to point to
 * the new commit SHA.
 * @method push
 * @param commit
 * @param callback
 */
Branch.prototype.push = function(commit, callback, force) {
    var me = this
        // The ref is something like "refs/heads/branchname" but we don't want
        // the "refs" part so we get rid of it here.
      , ref = this.ref.split('/').slice(1).join('/');
    me.gh.gitdata.updateReference({
        user: me.gh.user
      , repo: me.gh.repo
      , ref: ref
      , sha: commit.sha
      , force: force
    }, function(error, referenceData) {
        if (error) { return callback(error); }
        me.sha = referenceData.object.sha;
        callback();
    });
};

Branch.prototype.createBranch = function(name, callback) {
    var me = this;
    // This function requires a commit, so get one if we haven't yet.
    me.getCommit(function(error, commit) {
        me.gh.gitdata.createReference({
            user: me.gh.user
          , repo: me.gh.repo
          , ref: 'refs/heads/' + name
          , sha: commit.sha
        }, function(error, referenceData) {
            console.log(error);
            var newBranch = new Branch(referenceData, me.gh);
            callback(error, newBranch);
        });
    });
};

Branch.prototype.createPullRequest = function(featureBranch, title, body, callback) {
    var payload = {
        user: this.gh.user
      , repo: this.gh.repo
      , title: title
      , body: body
      , head: featureBranch.getClarifiedName()
      , base: this.getName()
    };
    this.gh.pullRequests.create(payload, callback);
};

/*
 * Work in Progress
 */
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

/**
 * Returns string description of this branch reference, including sha and ref.
 * @method toString
 * @returns {string}
 */
Branch.prototype.toString = function() {
    var out = 'sha: ' + this.sha + '\n'
            + 'ref: ' + this.ref + '\n';
    return out;
};

/**
 * Returns fully-clarified name of branch, including username (used for pull
 * requests sometimes), like "rhyolight:feature-a".
 * @returns {string}
 */
Branch.prototype.getClarifiedName = function() {
    return this.gh.user + ':' + this.getName();
};

/**
 * Returns the name of this branch, like "master".
 * @returns {string}
 */
Branch.prototype.getName = function() {
    return this.ref.split('/').pop();
};


// This is so Node.js will use toString within console.log().
Branch.prototype.inspect = Branch.prototype.toString;

module.exports = Branch;
