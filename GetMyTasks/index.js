import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import { getUserFromToken } from '../utils/auth.util.js';
import requestService from '../services/dataportal/request.service.js';

const getMyTasks = async (context, req) => {
  const username = await getUserFromToken(req.headers) ?? req.query.username;
  const data = await requestService.getDERequests({ username });
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getMyTasks, ['GET']);