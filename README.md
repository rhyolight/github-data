# GitHub Data

Work in progress.

## Usage

### Creating a GitData Instance

```javascript

var gdata = new GitData("username", "password", "organization", "repository");

```

### Changing a File

```javascript

gdata.getFile({
        path: "path/to/file/from/repo/root",
        branch: "master",
    }, function(err, file) {
        // Update something within the file.
        file.contents = fileObject.contents.replace("foo", "bar");
        file.commit("Commit message", function(err, commit) {
            console.log("Created commit with SHA '%s'", commit.sha);
        });
});

```