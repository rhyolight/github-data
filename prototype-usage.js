/*
 * This is just a brainstorm of what I want the API to look like. It doesn't
 * actually work.
 */

var gdata = new GitData("username", "password", "organization", "repository");

/**
 * Changing a file by committing directly to the master branch.
 */

gdata.getBranch("master", function(error, master) {
    master.getFile("path/to/file", function(error, file) {
        // Update something within the file.
        file.contents = file.contents.replace("foo", "bar");
        // Commit the changes to the file.
        file.commit("Commit message", function(error, commit) {
            console.log("Created commit with SHA '%s'", commit.sha);
            master.push(commit, function(error) {
                console.log("Changes pushed.");
            });
        });
    });
});

/**
 * Same file change, but putting the changes in a pull request against the
 * master branch.
 */

gdata.getBranch("master", function(error, master) {
    master.createBranch("feature-branch", function(error, featureBranch) {
        featureBranch.getFile("path/to/file", function(error, file) {
            // Update something within the file.
            file.contents = fileObject.contents.replace("foo", "bar");
            // Commit the changes to the file.
            file.commit("Commit message", function(error, commit) {
                console.log("Created commit with SHA '%s'", commit.sha);
                featureBranch.push(commit, function(error) {
                    featureBranch.createPullRequest({
                        title: "PR title",
                        body: "optional",
                        base: master
                    }, function(error, pr) {
                        console.log("Created PR #%s", pr.number);
                    });
                });
            });
        });
    });
});

