import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import devOpsService from '../services/devops/devops.service.js';

const test = async (context, req) => {
  const data = await devOpsService.createTicket();
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(test, ['POST']);