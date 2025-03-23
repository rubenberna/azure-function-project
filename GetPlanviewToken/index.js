import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import planViewService from '../services/planview/planview.service.js';

const getPlanViewToken = async (context, req) => {
  const data = await planViewService.getToken();
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getPlanViewToken, ['GET']);