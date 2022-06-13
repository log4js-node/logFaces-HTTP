export interface LogFacesHTTPAppender {
  type: "@log4js-node/logfaces-http";
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
}

// Add the LogFacesHTTPAppender to the list of appenders in log4js for better type support
declare module "log4js" {
  export interface Appenders {
    LogFacesHTTPAppender: LogFacesHTTPAppender;
  }
}
