var GitHubApi = require('github');


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

module.exports = GitData;