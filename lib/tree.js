var _ = require('lodash')
  , Blob = require('./blob');

function Tree(source, githubClient) {
    this.gh = githubClient;
    this.sha = source.sha;
    this.truncated = source.truncated;
    this.objects = source.tree;
}

Tree.prototype.getTree = function(path, callback) {
    var gh = this.gh
      , returnError
      , targetObject = _.find(this.objects, function(object) {
          return path == object.path;
      });
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
        callback(null, new Tree(response, gh))
    });
};

Tree.prototype.getBlob = function(path, callback) {
    var gh = this.gh
        , returnError
        , targetObject = _.find(this.objects, function(object) {
            return path == object.path;
        });
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
        callback(null, new Blob(response, gh))
    });
};


module.exports = Tree;