import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import requestService from '../services/dataportal/request.service.js';
import { getUserFromToken } from '../utils/auth.util.js';

const getUserPendingAdminRequests = async (context, req) => {
  const username = await getUserFromToken(req.headers) ?? req.query.username;
  
  const data = await requestService.getUserPendingAdminRequests({ username });
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getUserPendingAdminRequests, ['GET']);