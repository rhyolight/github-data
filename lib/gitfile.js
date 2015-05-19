/**
 *
 * @param path
 * @param blob
 * @param tree
 * @param commit
 * @constructor
 */
function GitFile(path, blob, tree, commit) {
    this.path = path;
    this.blob = blob;
    this.tree = tree;
    this._commit = commit;
}

GitFile.prototype.commit = function(message, callback) {
    var me = this;
    me.blob.update(function(err, blobData) {
        if (err) { return callback(err); }
        me.tree.setBlob(me.path, blobData.sha);
        me.tree.update(function(err, newTree) {
            if (err) { return callback(err); }
            me._commit.commitTree(newTree, message, callback);
        });
    });
};

GitFile.prototype.toString = function() {
    return 'GitFile for file at "' + this.path + '"\n' +
        'Blob:\n' + this.blob.toString() +
        'Tree:\n' + this.tree.toString() +
        'Commit:\n' + this._commit.toString();
};

// This is so Node.js will use toString within console.log().
GitFile.prototype.inspect = GitFile.prototype.toString;


module.exports = GitFile;