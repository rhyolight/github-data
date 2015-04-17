var _ = require('lodash')
  , Blob = require('./blob');

function Tree(source, parent, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.parent = parent;
    this.truncated = source.truncated;
    this.objects = source.tree;
    //console.log('created: tree %s', this.sha);
    //console.log('  my parent is %s', this.parent.sha);
}

Tree.prototype.getObjectDataByPath = function(path) {
    return _.find(this.objects, function(object) {
        return object.path == path;
    });
};

Tree.prototype.getObjectByPath = function(path, callback) {
    if (this.isBlob(path)) {
        this.getBlob(path, callback);
    } else if (this.isTree(path)) {
        this.getTree(path, callback);
    } else {
        // TODO: Throw error.
    }
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
    //console.log('%s getting %s', this.sha, path);
    var me = this
      , gh = this.gh
      , returnError
      , targetObject = this.getObjectDataByPath(path);
    if (! targetObject) {
        returnError = new Error('Tree path "' + path + '" does not exist.');
        returnError.code = 404;
        return callback(returnError);
    }
    if (targetObject.type !== "tree") {
        returnError = new TypeError('Specified tree path "' + path
            + '" is not a tree, it is a ' + targetObject.type + '.');
        returnError.code = 400;
        return callback(returnError);
    }
    gh.gitdata.getTree({
        user: gh.user
      , repo: gh.repo
      , sha: targetObject.sha
    }, function(err, response) {
        //console.log('tree %s is creating a subtree', me.sha);
        callback(null, new Tree(response, me, gh))
    });
};

Tree.prototype.getBlob = function(path, callback) {
    //console.log('%s getting %s', this.sha, path);
    var me = this
      , gh = this.gh
      , returnError
      , targetObject
      , pathParts
      , currentPath
      ;

    if (path.indexOf('/') > -1) {
        // Handle lower-level files.
        pathParts = path.split('/');
        while (pathParts.length > 0) {
            currentPath = pathParts.shift();
            this.getObjectByPath(currentPath, function(error, object) {
                if (error) {
                    return callback(error);
                }
                if (object instanceof Blob) {
                    callback(null, object);
                } else if (object instanceof Tree) {
                    object.getBlob(pathParts.join('/'), callback);
                }
            });
        }
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