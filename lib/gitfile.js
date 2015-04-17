function GitFile(path, blob, tree, commit) {
    this.path = path;
    this.blob = blob;
    this.tree = tree;
    this.commit = commit;
    this.contents = blob.getContents();
}

module.exports = GitFile;