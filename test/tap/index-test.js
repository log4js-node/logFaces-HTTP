'use strict';

const test = require('tap').test;
const sandbox = require('@log4js-node/sandboxed-module');
const appender = require('../../lib');

function setupLogging(category, options) {
  const fakeAxios = {
    create: function (config) {
      this.config = config;
      return {
        post: function (emptyString, event) {
          fakeAxios.args = [emptyString, event];
          return {
            catch: function (cb) {
              fakeAxios.errorCb = cb;
            }
          };
        }
      };
    }
  };

  const fakeConsole = {
    error: function (msg) {
      this.msg = msg;
    }
  };

  const appenderModule = sandbox.require('../../lib', {
    requires: {
      axios: fakeAxios
    },
    globals: {
      console: fakeConsole
    }
  });
  const log4js = sandbox.require('log4js', {
    requires: {
      '@log4js-node/logfaces-http': appenderModule
    },
    ignoreMissing: true
  });

  options.type = '@log4js-node/logfaces-http';
  log4js.configure({
    appenders: { http: options },
    categories: { default: { appenders: ['http'], level: 'trace' } }
  });

  return {
    logger: log4js.getLogger(category),
    fakeAxios: fakeAxios,
    fakeConsole: fakeConsole
  };
}

test('logFaces appender', (batch) => {
  batch.test('should export a configure function', (t) => {
    t.type(appender.configure, 'function');
    t.end();
  });

  batch.test('when using HTTP receivers', (t) => {
    const setup = setupLogging('myCategory', {
      application: 'LFS-HTTP',
      url: 'http://localhost/receivers/rx1'
    });

    t.test('axios should be configured', (assert) => {
      assert.equal(setup.fakeAxios.config.baseURL, 'http://localhost/receivers/rx1');
      assert.equal(setup.fakeAxios.config.timeout, 5000);
      assert.equal(setup.fakeAxios.config.withCredentials, true);
      assert.same(setup.fakeAxios.config.headers, { 'Content-Type': 'application/json' });
      assert.end();
    });

    setup.logger.addContext('foo', 'bar');
    setup.logger.addContext('bar', 'foo');
    setup.logger.warn('Log event #1');

    t.test('an event should be sent', (assert) => {
      const event = setup.fakeAxios.args[1];
      assert.equal(event.a, 'LFS-HTTP');
      assert.equal(event.m, 'Log event #1');
      assert.equal(event.g, 'myCategory');
      assert.equal(event.p, 'WARN');
      assert.equal(event.p_foo, 'bar');
      assert.equal(event.p_bar, 'foo');

      // Assert timestamp, up to hours resolution.
      const date = new Date(event.t);
      assert.equal(
        date.toISOString().substring(0, 14),
        new Date().toISOString().substring(0, 14)
      );
      assert.end();
    });

    t.test('errors should be sent to console.error', (assert) => {
      setup.fakeAxios.errorCb({ response: { status: 500, data: 'oh no' } });
      assert.equal(
        setup.fakeConsole.msg,
        'log4js.logFaces-HTTP Appender error posting to http://localhost/receivers/rx1: 500 - oh no'
      );
      setup.fakeAxios.errorCb(new Error('oh dear'));
      assert.equal(setup.fakeConsole.msg, 'log4js.logFaces-HTTP Appender error: oh dear');
      assert.end();
    });
    t.end();
  });

  batch.test('should serialise stack traces correctly', (t) => {
    const setup = setupLogging('stack-traces', {
      url: 'http://localhost/receivers/rx1'
    });

    setup.logger.error('Oh no', new Error('something went wrong'));
    const event = setup.fakeAxios.args[1];
    t.match(event.m, /Error: something went wrong/);
    t.match(event.m, /at Test.batch.test/);
    t.end();
  });

  batch.end();
});
