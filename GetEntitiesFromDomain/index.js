import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import dbbService from '../services/dataportal/dbb.service.js';


const getDBsFromDomain = async (context, req) => {
  const data = await dbbService.getEntitiesFromDomain(req.query);
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getDBsFromDomain);