/**
 * A git blob object.
 * @class Blob
 * @param source {Object} JSON response from API, used to build.
 * @param parent {Object} Expected to be {{#crossLink "Tree"}}{{/crossLink}}.
 * @param githubClient {Object} GitHub API Client object.
 * @constructor
 */
function Blob(source, parent, githubClient) {
    this.gh = githubClient;
    this.parent = parent;
    this.sha = source.sha;
    this.rawContent = source.content;
    this.size = source.size;
    this.contents = new Buffer(this.rawContent, 'base64').toString('utf-8');
}

/**
 * Gets utf-8 contents of blob.
 * @method getContents
 * @returns {String}
 */
Blob.prototype.getContents = function() {
    return this.contents
};

/**
 * Sets utf-8 contents of blob.
 * @method setContents
 * @param contents {String}
 */
Blob.prototype.setContents = function(contents) {
    this.contents = contents;
};

/**
 * Checks to see if this blob object is dirty and its contents are different
 * from those returned from the GitHub Git Data API when it was originally
 * created.
 * @method hasContentsChanged
 * @returns {boolean}
 */
Blob.prototype.hasChangedContents = function() {
    var originalContents =
            new Buffer(this.rawContent, 'base64').toString('utf-8')
      , currentContents = this.getContents()
      ;
    return originalContents != currentContents;
};

/**
 * Posts a new blob object with this blob's current contents and returns the
 * response data from the API. This function does not create a
 * {{#crossLink "Blob"}}{{/crossLink}} object.
 * @method update
 * @param callback
 */
Blob.prototype.update = function(callback) {
    var error
      , gh = this.gh
      ;

    if (! this.hasChangedContents()) {
        error = new Error('Blob contents have not changed.');
        error.code = 400;
        callback(error);
    } else {
        gh.gitdata.createBlob({
            user: gh.user
          , repo: gh.repo
          , content: this.getContents()
          , encoding: 'utf-8'
        }, callback);

    }
};

Blob.prototype.toString = function() {
    return 'blob ' + this.sha
        + ' (' + this.size + ') contents:\n'
        + this.getContents();
};

// This is so Node.js will use toString within console.log().
Blob.prototype.inspect = Blob.prototype.toString;

module.exports = Blob;