var Branch = require('./branch')
  , GitHubApi = require('github')
    ;


function GitData(username, password, organization, repository) {
    if (! username) {
        throw new Error('Missing username.');
    }
    if (! password) {
        throw new Error('Missing password.');
    }
    if (! organization) {
        throw new Error('Missing organization.');
    }
    if (! repository) {
        throw new Error('Missing repository.');
    }
    this.username = username;
    this.password = password;
    this.organization = organization;
    this.repository = repository;
    this.gh = new GitHubApi({
        version: '3.0.0'
      , timeout: 5000
    });
    this.gh.authenticate({
        type: 'basic'
      , username: this.username
      , password: this.password
    });
}

GitData.prototype._getBaseRequestPayload = function() {
    return {
        user: this.organization
      , repo: this.repository
    };
};

GitData.prototype.getBranch = function(name, callback) {
    var params = this._getBaseRequestPayload();
    params.ref = 'heads/' + name;
    this.gh.gitdata.getReference(params, function(error, response) {
        var returnError;
        if (error) {
            returnError = new Error('Branch "' + name + '" does not exist.');
            returnError.code = error.code;
            return callback(returnError);
        }
        callback(null, new Branch());
    });
};

module.exports = GitData;