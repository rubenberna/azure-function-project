import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import requestService from '../services/dataportal/request.service.js';

const getDataApprovers = async (context, req) => {
  const data = await requestService.getDataApprovers(req.query);
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getDataApprovers, ['GET']);