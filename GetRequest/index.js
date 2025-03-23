import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import requestService from '../services/dataportal/request.service.js';

const getRequest = async (context, req) => {
  const data = await requestService.getRequest(req.query);
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getRequest, ['GET']);