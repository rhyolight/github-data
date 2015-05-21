var GitData = require('./index');
var username = process.env['GH_USERNAME'];
var authToken = process.env['GH_PASSWORD'];

var gdata = new GitData(username, authToken, "numenta", "experiments");


gdata.getBranch("master", function(err, master) {
    console.log('branch: ' + master.ref);

    /* The short way to do it: */
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

    /**
     * Same file change, but putting the changes in a pull request against the
     * master branch.
     */

    master.createBranch('feature-branch5', function(error, featureBranch) {
        featureBranch.getFile('temp.txt', function(error, file) {
            // Update something within the file.
            file.blob.setContents(file.blob.getContents() + '\nUpdated on: ' + new Date());
            // Commit the changes to the file.
            file.commit('Updated through GitFile interface.', function(err, commit) {
                console.log('Created commit with SHA "%s"', commit.sha);
                featureBranch.push(commit, function(error) {
                    console.log(error);
                    featureBranch.createPullRequest(master, 'Automated PR test', 'Some hot body here.', function(error, pr) {
                        console.log('Created PR #%s', pr.number);
                    });
                });
            });
        });
    });

    /* The long manual way to do it: */
    master.getCommit(function(err, commit) {
        console.log('commit: ' + commit.sha);

        commit.getTree(function(err, tree) {
            console.log(tree);

            tree.getBlob('temp.txt', function(err, blob) {
                console.log(('old blob contents:\n' +
                    '========================================================' +
                    '\n%s\n' +
                    '========================================================'),
                    blob.getContents());

                blob.setContents(blob.getContents() + '\nUpdated on: ' + new Date());

                console.log(('new blob contents:\n' +
                    '========================================================' +
                    '\n%s\n' +
                    '========================================================'),
                    blob.getContents());

                blob.update(function(err, blobData) {
                    console.log('new blob sha: ', blobData.sha);

                    tree.setBlob('temp.txt', blobData.sha);

                    tree.update(function(err, newTree) {
                        console.log('New Tree:');
                        console.log(newTree);

                        var message = 'This commit is being created through the GitHub Git Data API.';
                        commit.commitTree(newTree, message, function(err, newCommit) {
                            console.log('Commit created:');
                            console.log(newCommit);
                            master.push(newCommit, function(err) {
                                console.log('push done!');
                                master.getCommit(function(error, latestCommit) {
                                    console.log(latestCommit);
                                });
                            });
                        });

                    });

                });

            });

        });

    });

});