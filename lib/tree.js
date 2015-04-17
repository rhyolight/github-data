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
    //console.log('%s is getting object at path %s', this.sha, path);
    var error;
    if (this.isBlob(path)) {
        this.getBlob(path, callback);
    } else if (this.isTree(path)) {
        this.getTree(path, callback);
    } else {
        error = new Error('Object path "' + path + '" does not exist.');
        error.code = 404;
        callback(error);
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
    //console.log('%s getting tree at %s', this.sha, path);
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
            //console.log('tree %s is creating a subtree', me.sha);
            callback(null, new Tree(response, me, gh))
        });
    }
};

Tree.prototype.getBlob = function(path, callback) {
    //console.log('%s getting blob at %s', this.sha, path);
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
        //console.log('identified lower-level file request');
        pathParts = path.split('/');
        topDir = pathParts.shift();
        remainingPath = pathParts.join('/');
        //console.log(topDir);
        this.getTree(topDir, function(error, tree) {
            if (error) {
                return callback(error);
            }
            //console.log('calling getblob on subtree...');
            tree.getBlob(remainingPath, function(error, blob) {
                if (error) {
                    //console.log(-3 + ' ' + me.sha);
                    error.message = error.message.replace(remainingPath, path);
                    return callback(error);
                }
                //console.log(4 + ' ' + me.sha);
                callback(null, blob);
            });
        });
    } else {
        //console.log('identified top-level file request');
        targetObject = this.getObjectDataByPath(path);
        if (! targetObject) {
            returnError = new Error('Blob path "' + path + '" does not exist.');
            returnError.code = 404;
            //console.log(-5 + ' ' + me.sha);
            return callback(returnError);
        }
        if (targetObject.type !== "blob") {
            returnError = new TypeError('Specified blob path "' + path
                + '" is not a blob, it is a ' + targetObject.type + '.');
            returnError.code = 400;
            //console.log(-6 + ' ' + me.sha);
            return callback(returnError);
        }
        gh.gitdata.getBlob({
            user: gh.user
            , repo: gh.repo
            , sha: targetObject.sha
        }, function(err, response) {
            //console.log(7 + ' ' + me.sha);
            callback(null, new Blob(response, me, gh))
        });
    }

};


module.exports = Tree;