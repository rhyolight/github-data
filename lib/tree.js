var _ = require('lodash')
  , Blob = require('./blob');

function Tree(source, parent, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.parent = parent;
    this.truncated = source.truncated;
    this.objects = source.tree;
}

Tree.prototype.getObjectDataByPath = function(path) {
    return _.find(this.objects, function(object) {
        return object.path == path;
    });
};

Tree.prototype.isTree = function(path) {
    var object = this.getObjectDataByPath(path);
    if (! object) {
        return false;
    }
    return object.type == "tree";
};

Tree.prototype.isBlob = function(path) {
    var object = this.getObjectDataByPath(path);
    if (! object) {
        return false;
    }
    return object.type == "blob";
};

Tree.prototype.getTree = function(path, callback) {
    var me = this
      , gh = this.gh
      , returnError
      , targetObject = this.getObjectDataByPath(path);
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
};

Tree.prototype.getBlob = function(path, callback) {
    var me = this
      , gh = this.gh
      , returnError
      , targetObject
      , pathParts
      , topDir
      , remainingPath
      ;

    if (path.indexOf('/') > -1) {
        // Handle lower-level files.
        pathParts = path.split('/');
        topDir = pathParts.shift();
        remainingPath = pathParts.join('/');
        this.getTree(topDir, function(error, tree) {
            if (error) {
                return callback(error);
            }
            tree.getBlob(remainingPath, function(error, blob) {
                if (error) {
                    error.message = error.message.replace(remainingPath, path);
                    return callback(error);
                }
                callback(null, blob);
            });
        });
    } else {
        targetObject = this.getObjectDataByPath(path);
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


module.exports = Tree;