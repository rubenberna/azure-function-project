import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import { getUserFromToken } from '../utils/auth.util.js';
import requestService from '../services/dataportal/request.service.js';
import { REQUEST_TYPE } from '../types/request.type.js';

const createRequest = async (context, req) => {
  const userName = await getUserFromToken(req.headers) ?? req.body.username;
  const data = await requestService.createRequest({ ...req.body, [REQUEST_TYPE.CREATED_BY]: userName });
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(createRequest, ['POST']);