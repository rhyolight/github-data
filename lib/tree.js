var _ = require('lodash')
  , Blob = require('./blob');

/*
 * Is this path string a deep path or just one file or directory?
 */
function isDeep(path) {
    return path.indexOf('/') > -1;
}


/**
 * A git tree object.
 * @class Tree
 * @param source {Object} JSON response from API, used to build.
 * @param parent {Object} Expected to be {{#crossLink "Tree"}}{{/crossLink}} or
 *                        {{#crossLink "Commit"}}{{/crossLink}}.
 * @param githubClient {Object} GitHub API Client object.
 * @constructor
 */
function Tree(source, parent, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.parent = parent;
    this.truncated = source.truncated;
    this.objects = _.cloneDeep(source.tree);
    this._source = source;
}

Tree.prototype._getObjectDataByPath = function(path) {
    return _.find(this.objects, function(object) {
        return object.path == path;
    });
};

/**
 * Checks to see if this tree object is dirty, meaning the tree objects have
 * been manually changed since being retrieved from the API.
 * @method hasChanged
 * @returns {boolean}
 */
Tree.prototype.hasChanged = function() {
    return JSON.stringify(this._source.tree) != JSON.stringify(this.objects);
};

/**
 * Checks if path points to a {{#crossLink "Tree"}}{{/crossLink}}.
 * @method isTree
 * @param path {String} Path to an object within the tree.
 * @returns {boolean}
 */
Tree.prototype.isTree = function(path) {
    var object = this._getObjectDataByPath(path);
    if (! object) {
        return false;
    }
    return object.type == "tree";
};

/**
 * Checks if path points to a {{#crossLink "Blob"}}{{/crossLink}}.
 * @method isBlob
 * @param path {String} Path to an object within the tree.
 * @returns {boolean}
 */
Tree.prototype.isBlob = function(path) {
    var object = this._getObjectDataByPath(path);
    if (! object) {
        return false;
    }
    return object.type == "blob";
};

/**
 * This function takes a path, assuming it contains more than one level, and
 * gets the top level Tree object and calls an "operation" on it (probably
 * either 'getTree' or 'getBlob'), calling the callback function with the
 * result. This is useful for navigating down tree chains.
 * @param path {String} Complex path (more than just one directory or file)
 * @param operation {String} Name of function to call on resulting Tree
 * @param callback {Function} Called with result of operation (Error, Object)
 * @private
 */
Tree.prototype._callOnNextTree = function(path, operation, callback) {
    var pathParts = path.split('/')
      , topDir = pathParts.shift()
      , remainingPath = pathParts.join('/')
      ;

    this.getTree(topDir, function(error, topTree) {
        if (error) {
            return callback(error);
        }
        topTree[operation](remainingPath, function(error, result) {
            if (error) {
                error.message = error.message.replace(remainingPath, path);
                return callback(error);
            }
            callback(null, result);
        });
    });

};

/**
 * Fetches a {{#crossLink "Tree"}}{{/crossLink}}, given a path.
 * @method getTree
 * @param path {String} Path to the tree.
 * @param callback {Function} Called with (Error, {{#crossLink "Tree"}}{{/crossLink}})
 */
Tree.prototype.getTree = function(path, callback) {
    var me = this
      , gh = this.gh
      , returnError
      , targetObject
      ;

    if (isDeep(path)) {
        this._callOnNextTree(path, 'getTree', callback);
    } else {
        targetObject = this._getObjectDataByPath(path);
        if (! targetObject) {
            returnError = new Error('Tree path "' + path + '" does not exist.');
            returnError.code = 404;
            callback(returnError);
        } else if (targetObject.type !== "tree") {
            returnError = new TypeError('Specified tree path "' + path
                + '" is not a tree, it is a ' + targetObject.type + '.');
            returnError.code = 400;
            callback(returnError);
        } else {
            gh.gitdata.getTree({
                user: gh.user
                , repo: gh.repo
                , sha: targetObject.sha
            }, function(err, response) {
                callback(null, new Tree(response, me, gh))
            });
        }
    }
};

/**
 * Fetches a {{#crossLink "Blob"}}{{/crossLink}}, given a path. This function
 * will traverse subtrees to get to the blob if necessary. If it does, the Blob
 * object passed back may not have this tree as its parent, but the subtree
 * immediately above it.
 * @method getBlob
 * @param path {String} Path to the blob.
 * @param callback {Function} Called with (Error, {{#crossLink "Blob"}}{{/crossLink}})
 */
Tree.prototype.getBlob = function(path, callback) {
    var me = this
      , gh = this.gh
      , returnError
      , targetObject
      ;

    if (isDeep(path)) {
        this._callOnNextTree(path, 'getBlob', callback);
    } else {
        targetObject = this._getObjectDataByPath(path);
        if (! targetObject) {
            returnError = new Error('Blob path "' + path + '" does not exist.');
            returnError.code = 404;
            return callback(returnError);
        }
        if (targetObject.type !== "blob") {
            returnError = new TypeError('Specified blob path "' + path
                + '" is not a blob, it is a ' + targetObject.type + '.');
            returnError.code = 400;
            return callback(returnError);
        }
        gh.gitdata.getBlob({
            user: gh.user
            , repo: gh.repo
            , sha: targetObject.sha
        }, function(err, response) {
            callback(null, new Blob(response, me, gh))
        });
    }

};

//Tree.prototype.createBlob = function(currentBlob, callback) {
//    var me = this;
//    currentBlob.update(function(error, blobData) {
//        if (error) {
//            return callback(error);
//        }
//        // Attach contents of previous blob object, because response from API
//        // does not contain contents.
//        blobData.content = new Buffer(
//            currentBlob.getContents(), 'utf-8'
//        ).toString('base64');
//        callback(null, new Blob(blobData, me, me.gh));
//    });
//};

/**
 * Returns string representation of the Tree object, including all objects
 * within the Tree.
 * @method toString
 * @returns {string}
 */
Tree.prototype.toString = function() {
    var out = 'tree ' + this.sha + ':\n';
    _.each(this.objects, function(object) {
        out += '- ' + object.type + ' ' + object.sha + ' ' + object.path;
        if (object.type == 'blob') {
            out += ' (' + object.size + ')';
        }
        out += '\n';
    });
    return out;
};

// This is so Node.js will use toString within console.log().
Tree.prototype.inspect = Tree.prototype.toString;

module.exports = Tree;