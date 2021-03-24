require('../../datalayer/databases/mongo');

import restify from 'restify';
import { Router, } from 'restify-router';
import corsMiddleware from 'restify-cors-middleware';
import signale from 'signale';

import project from 'datalayer/config/project';

import RouterManager from 'service/api/routes';
import { allowOrigins, } from 'utils';
import { RequestCustom, } from 'types/common.types';
import morgan from 'morgan';

const server = restify.createServer({
  name: 'parsing-api',
});

const cors = corsMiddleware({
  allowHeaders : [ 'X-XSRF-TOKEN', 'Authorization', ],
  credentials  : true,
  exposeHeaders: [],
  origins      : allowOrigins(),
});

const router = new Router();
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(morgan('dev'));
server.pre(cors.preflight);
server.use(cors.actual);

router.add('/api/v1', RouterManager);
router.applyRoutes(server);

server.get('/health', (req: RequestCustom, res) => {
  const defaultResponse = {
    date   : Date.now(),
    name   : project.restify.name,
    version: project.restify.version,
  };
  try {
    return res.json(defaultResponse);
  } catch (error) {
    return res.json({
      ...defaultResponse,
      error: error.message,
    });
  }
});

server.listen(project.restify.port, () => {
  const launchDate = new Date();
  signale.success(`[KROWDY] server launch ${launchDate}`);
  signale.success(
    `Explore this api in : http://localhost:${project.restify.port}`
  );
});
