# logFaces Appender (HTTP) for log4js-node

The logFaces appenders send JSON formatted log events to [logFaces](http://www.moonlit-software.com) receivers. This appender uses HTTP to send the events (there is another logFaces appender that uses [UDP](https://github.com/log4js-node/logFaces-UDP)).

```bash
npm install log4js @log4js-node/logfaces-http
```

## Configuration

* `type` - `@log4js-node/logfaces-http`
* `url` - `string` - logFaces receiver servlet URL
* `application` - `string` (optional, defaults to empty string) - used to identify your application's logs
* `timeout` - `integer` (optional, defaults to 5000ms) - the timeout for the HTTP request.
* `configContext` - function (optional) returning a global context object accessible to all appenders. Properties from configContext added as `p_` values in the logFaces event.

This appender will also pick up Logger context values from the events, and add them as `p_` values in the logFaces event. See the example below for more details. Note that Logger context may override the same properties defined in `configContext`.

# Example (default config)

```javascript

const MDC = {
  sessionID: 111
};

log4js.configure({
  appenders: {
    logfaces: { type: '@log4js-node/logfaces-http', url: 'http://lfs-server/logs', application: 'TesterApp', configContext: () => MDC }
  },
  categories: {
    default: { appenders: [ 'logfaces' ], level: 'info', enableCallStack: true }
  }
});

const logger = log4js.getLogger();
logger.addContext('requestId', '123');
logger.info('some interesting log message');

MDC.sessionID = 222;
logger.error('something has gone wrong', new Error('exception message'));
```
This example will result in two log events being sent to `lfs-server`. Both events will have a `p_requestId` property with a value of `123`. First event will have `p_sessionID` of `111` and second `p_sessionID` of `222`. Also since `enableCallStack` is set, both events will include location details such as file name, function name and line number. Second event will have a stack trace of a trown error.
