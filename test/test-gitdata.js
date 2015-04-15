var _ = require('lodash')
  , assert = require('chai').assert
  , expect = require('chai').expect
  , should = require('chai').should()
  , proxyquire = require('proxyquire')
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

});