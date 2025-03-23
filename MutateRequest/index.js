import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import { getUserFromToken } from '../utils/auth.util.js';
import mutationService from '../services/dataportal/mutation.service.js';

const mutateRequest = async (context, req) => {
  const username = await getUserFromToken(req.headers) ?? req.body.username;
  const data = await mutationService.mutateRequest({ USER: username, ...req.body });
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(mutateRequest, ['POST']);