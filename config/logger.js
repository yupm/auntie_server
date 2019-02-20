'use strict';

const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');
require('winston-daily-rotate-file');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';


// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logDir}/%DATE%-auntie.log`,
    datePattern: 'YYYY-MM-DD',
    handleExceptions: true,
    format: format.combine(
        format.printf(
          info =>
            `${info.timestamp} [${info.label}]: ${info.message}`
        ),
        format.json()
      )
  });
  

const logger = caller => {
  return createLogger({
    // change level if in dev environment versus production
    level: env === 'production' ? 'info' : 'debug',
    format: format.combine(
      format.label({ label: path.basename(caller) }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    transports: [
     /* new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            info =>
              `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
          )
        )
      }),*/
      dailyRotateFileTransport
    ]
  });
};

module.exports = logger;