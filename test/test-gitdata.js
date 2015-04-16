var _ = require('lodash')
  , assert = require('chai').assert
  , expect = require('chai').expect
  , proxyquire = require('proxyquire')
  , Branch = require('../lib/branch')
  , mockRefMaster = require('./mock-data/ref-master')
  ;

describe('github-data', function() {

    describe('when constructed', function() {
        var authenticated = false;
        var mockGitHubInstance = {
            authenticate: function(params) {
                assert.equal('basic', params.type, 'Missing GitHub auth type during authentication.');
                assert.equal('my-username', params.username, 'Missing GitHub username during authentication.');
                assert.equal('my-password', params.password, 'Missing GitHub password during authentication.');
                authenticated = true;
            }
        };

        var GitData = proxyquire('../lib/gitdata', {
            'github': function () {
                return mockGitHubInstance;
            }
        });

        describe('without username', function() {
            it('throws proper error', function() {
                expect(function() {
                    new GitData(undefined, 'my-password');
                }).to.throw('Missing username.');
            });
        });

        describe('without password', function() {
            it('throws proper error', function() {
                expect(function() {
                    new GitData('my-username');
                }).to.throw('Missing password.');
            });
        });

        describe('without organization', function() {
            it('throws proper error', function() {
                expect(function() {
                    new GitData('my-username', 'my-password');
                }).to.throw('Missing organization.');
            });
        });

        describe('without repository', function() {
            it('throws proper error', function() {
                expect(function() {
                    new GitData('my-username', 'my-password', 'my-organization');
                }).to.throw('Missing repository.');
            });
        });

        describe('with required configuration', function() {
            it('authenticates through GitHub', function() {
                new GitData('my-username', 'my-password', 'organization', 'repository');
                assert.ok(authenticated, 'Did not authenticate upon construction.');
            });
        });

    });

    describe('when getting branch', function() {
        var mockGitHubInstance = {
            authenticate: function() {},
            gitdata: {
                getReference: function(params, callback) {
                    expect(params.user).to.equal('my-organization');
                    expect(params.repo).to.equal('my-repository');
                    if (params.ref !== 'heads/master') {
                        return callback({"code":404,"message":"{\"message\":\"Not Found\",\"documentation_url\":\"https://developer.github.com/v3\"}"})
                    }
                    callback();
                }
            }
        };

        var GitData = proxyquire('../lib/gitdata', {
            'github': function () {
                return mockGitHubInstance;
            }
        });

        var gd = new GitData(
            'my-username', 'my-password', 'my-organization', 'my-repository'
        );

        it('calls gitdata.getReference() correctly', function(done) {
            gd.getBranch('master', function() {
                done();
            });
        });

        it('returns proper error when bad branch name', function(done) {
            gd.getBranch('noop', function(error) {
                assert.ok(error, "Nonexistant branch name should throw error");
                expect(error).to.be.instanceOf(Error);
                expect(error).to.have.property('message');
                expect(error.message).to.equal('Branch "noop" does not exist.');
                expect(error).to.have.property('code');
                expect(error.code).to.equal(404);
                done();
            });
        });

        it('returns a Branch object', function(done) {
            gd.getBranch('master', function(error, branch) {
                assert.notOk(error);
                expect(branch).to.be.instanceOf(Branch);
                done();
            });
        });

    });

});