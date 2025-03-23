import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import dbbService from '../services/dataportal/dbb.service.js';

const getDomains = async (context) => {
  const data = await dbbService.getDomains();
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getDomains);