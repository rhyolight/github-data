var Branch = require('./branch')
  , GitHubApi = require('github')
  ;

/**
 * Interface to the GitHub Git Data API (https://developer.github.com/v3/git/).
 * Builds on top of the excellent Node.js GitHub API client
 * https://github.com/mikedeboer/node-github.
 * @class GitData
 * @param username {String} GitHub username.
 * @param password {String} GitHub password.
 * @param organization {String} GitHub organization.
 * @param repository {String} GitHub repository.
 * @constructor
 */
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
    // Stash org and repo on GitHub Client object so it contains all the data it
    // needs to make API calls no matter where it is.
    this.gh.user = this.organization;
    this.gh.repo = this.repository;
}

/**
 * Fetches branch data and converts it into a
 * {{#crossLink "Branch"}}{{/crossLink}}.
 * @method getBranch
 * @param name {String} Name of branch to fetch.
 * @param callback {Function} Called with (Error, {{#crossLink "Branch"}}{{/crossLink}}).
 */
GitData.prototype.getBranch = function(name, callback) {
    var gh = this.gh;
    gh.gitdata.getReference({
        user: gh.user
      , repo: gh.repo
      , ref: 'heads/' + name
    }, function(error, response) {
        var returnError;
        if (error || ! response.object) {
            returnError = new Error('Cannot get reference to "heads/' + name + '"!');
            returnError.code = 'uknown';
            if (error) {
                returnError.code = error.code;
            }
            if (! response.object) {
                console.log(response);
            }
            return callback(returnError);
        }
        callback(null, new Branch(response, gh));
    });
};

module.exports = GitData;
