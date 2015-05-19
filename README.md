# GitHub Data

[![Build Status](https://travis-ci.org/rhyolight/github-data.svg?branch=master)](https://travis-ci.org/rhyolight/github-data) [![Coverage Status](https://coveralls.io/repos/rhyolight/github-data/badge.svg?branch=master)](https://coveralls.io/r/rhyolight/github-data?branch=master)

[![NPM](https://nodei.co/npm/github-data.png?mini=true)](https://nodei.co/npm/github-data/)

This is essentially a Node.js interface to make low-level git calls through the [GitHub Git Data API](https://developer.github.com/v3/git/).

Docs are in [the docs folder](docs). Here's a simple example of how to use it. 

Low level git plumbing objects are available to do pretty much whatever you want with. There is also a `GitFile` inteface that tries to simplify some things. But it has only been tested with files in the root directory of the repository.

```javascript
var GitData = require('./index');
var username = process.env['GH_USERNAME'];
var authToken = process.env['GH_PASSWORD'];

var gdata = new GitData(username, authToken, "numenta", "experiments");

gdata.getBranch("master", function(err, master) {
    console.log('branch: ' + master.ref);

    master.getFile('temp.txt', function(err, file) {
        console.log(file);
        file.blob.setContents(file.blob.getContents() + '\nUpdated on: ' + new Date());
        file.commit('Updated through GitFile interface.', function(err, commit) {
            // Still have to push the new commit.
            master.push(commit, function(err) {
                console.log('push done!');
                master.getCommit(function(error, latestCommit) {
                    console.log(latestCommit);
                });
            });
        });
    });

});
```
