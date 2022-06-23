import type { Agent as httpAgent } from 'http';
import type { Agent as httpsAgent } from 'https';

export interface LogFacesHTTPAppender {
  type: '@log4js-node/logfaces-http';
  /** logFaces receiver servlet URL */
  url: string;
  /** used to identify your application’s logs
   * @default ''
   * */
  application?: string;
  /** the timeout for the HTTP request.
   * @default 5000ms
   * */
  timeout?: number;
  /** logFaces hostname (h) property */
  hostname?: string;
  /** The shared global config to include in your logs */
  configContext?: () => Record<string, string | number>;
  /** An http.Agent or https.Agent to allow configuring behavior as needed.
   * Make sure you use the correct type base on your url
   */
  agent?: httpAgent | httpsAgent;
}

// Add the LogFacesHTTPAppender to the list of appenders in log4js for better type support
declare module 'log4js' {
  export interface Appenders {
    LogFacesHTTPAppender: LogFacesHTTPAppender;
  }
}
