export interface LogFacesHTTPAppender {
        type: '@log4js-node/logfaces-http';
        // logFaces receiver servlet URL
        url: string;
        // (defaults to empty string) - used to identify your application’s logs
        application?: string;
        // (defaults to 5000ms) - the timeout for the HTTP request.
        timeout?: number;
}
