import type { Agent as httpAgent } from 'http';
import type { Agent as httpsAgent } from 'https';
import type { LoggingEvent } from 'log4js';

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
  /** Adjust the resulting logfacesEvent that is sent out.
   *
   * Needs to return the new layout or undefined to ignore the event.
   *
   * If `LogFacesEvent.m` is nullish: it will be populated with the default formatter
   * */
  eventLayout?: LogFacesLayoutFunction;
}

export type LogFacesLayoutFunction = (
  loggingEvent: LoggingEvent,
  logFacesEvent: Omit<LogFacesEvent, 'm'>
) => LogFacesEvent | undefined | null;

/** [Data model: Log events](http://www.moonlit-software.com/logfaces/downloads/logfaces-manual.pdf) */
export interface LogFacesEvent {
  /** Time stamp as specified by the source or server */
  t: number;
  /** Severity of event expressed in term of log4j levels */
  p: number | string;
  /**  Name of the domain (or application) originating the event */
  a: string;
  /** Name of the host originating the event */
  h?: string;
  /** Name of the logger (class, module, etc) originating the event */
  g: string;
  /** Name of the thread originating the event */
  r?: string;
  /** Message Content */
  m?: string;
  /** [Network Diagnostic Context](http://logging.apache.org/log4j/1.2/apidocs/org/apache/log4j/NDC.html) */
  n?: unknown;
  /** Indication whether the event is a thrown exception */
  w?: boolean;
  /** Stack trace of thrown exceptions */
  i?: string;
  /** File name (of the source code location originating the event) */
  f?: string;
  /** Class name (of the source code location originating the event) */
  c?: string;
  /** Method name (of the source code location originating the event) */
  e?: string;
  /** Line number (of the source code location originating the event) */
  l?: string | number;
  /** MDC (Mapped Diagnostic Context) properties, p_XXX, where XXX is a property name */
  [key: `p_${string}`]: string | number;
}

// Add the LogFacesHTTPAppender to the list of appenders in log4js for better type support
declare module 'log4js' {
  export interface Appenders {
    LogFacesHTTPAppender: LogFacesHTTPAppender;
  }
}
