import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import indexRoutes from './routes/index.routes';
import documentation from './docs';
import prisma from './client';
import logger from './config/logger';
import initialVariables from './config/initialVariables';
import { errorMiddleware } from './middleware/errorMiddleware';
import cors from 'cors';

const app = express();

Sentry.init({
  dsn: 'https://00d1983f248c4c16c748476564b2a0b4@o4506223662071808.ingest.sentry.io/4506280824274944',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration()
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0
});
// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.get('/', function rootHandler(req, res) {
  res.end('Hello world!');
});

app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

app.get('/debug-sentry', function mainHandler(req, res) {
  throw new Error('My first Sentry error!');
});

app.use(cors({ origin: '*' }));
app.use(cookieParser());
const PORT = initialVariables.port;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(documentation);
// app.get('/', (req, res) => {
//   res.send('Hello World');
// });
app.use('/api', indexRoutes);
prisma.$connect().then(() => {
  logger.info('Connected to  Database');

  app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT}`);
  });
});

app.use(errorMiddleware);
