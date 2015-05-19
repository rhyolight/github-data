/*
 * This is just a brainstorm of what I want the API to look like. It doesn't
 * actually work.
 */

var gdata = new GitData('username', 'password', 'organization', 'repository');

/**
 * Manually committing a file change.
 */

gdata.getBranch('master', function(error, master) {
    master.getCommit(function(error, commit) {
        commit.getTree(function(error, tree) {
            tree.getBlob(path, function(error, blob) {
                blob.setContents('new contents');
                //commit.commit(blob, 'Commit message.', function(err, commit) {
                //
                //});

                // 1. Create new blob through api.
                // 2. Given the new blob sha, walk up the chain of parents of
                //    old blob, which should be all trees up to a commit. For
                //    each parent tree:
                //     - create new tree with same tree objects except for the
                //       updated child sha, which should point to the new child
                //       object sha
                //     - check to see if current parent's parent is a tree
                //        - if tree: repeat #2 sub-tasks
                //        - if commit, proceed to #3
                // 3. Create a new commit pointing to the topmost parent tree
                //    in the parent chain.
            });
        });
    });
});

/**
 * Changing a file by committing directly to the master branch.
 */

gdata.getBranch('master', function(error, master) {
    master.getFile('path/to/file', function(error, file) {
        // Update something within the file.
        file.blob.setContents(file.blob.getContents().replace('foo', 'bar'));
        // Commit the changes to the file.
        file.commit('Commit message', function(error, commit) {
            console.log('Created commit with SHA "%s"', commit.sha);
            master.push(commit, function(error) {
                console.log('Changes pushed.');
            });
        });
    });
});

/**
 * Same file change, but putting the changes in a pull request against the
 * master branch.
 */
//
//gdata.getBranch('master', function(error, master) {
//    master.createBranch('feature-branch', function(error, featureBranch) {
//        featureBranch.getFile('path/to/file', function(error, file) {
//            // Update something within the file.
//            file.contents = fileObject.contents.replace('foo', 'bar');
//            // Commit the changes to the file.
//            file.commit('Commit message', function(error, commit) {
//                console.log('Created commit with SHA "%s"', commit.sha);
//                featureBranch.push(commit, function(error) {
//                    featureBranch.createPullRequest({
//                        title: 'PR title',
//                        body: 'optional',
//                        base: master
//                    }, function(error, pr) {
//                        console.log('Created PR #%s', pr.number);
//                    });
//                });
//            });
//        });
//    });
//});

