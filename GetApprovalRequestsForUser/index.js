import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import requestService from '../services/dataportal/request.service.js';
import { getUserFromToken } from '../utils/auth.util.js';

const getApprovalRequestsForUser = async (context, req) => {
  const username = await getUserFromToken(req.headers) ?? req.query.username;
  
  const data = await requestService.getApprovalRequestsForUser({ username });
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getApprovalRequestsForUser, ['GET']);