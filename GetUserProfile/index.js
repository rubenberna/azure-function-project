import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import userService from '../services/dataportal/user.service.js';
import { getUserFromToken } from '../utils/auth.util.js';

const getUserProfile = async (context, req) => {
  const username = await getUserFromToken(req.headers) ?? req.query.username;
  const data = await userService.getUserProfile(username);
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getUserProfile, ['GET']);