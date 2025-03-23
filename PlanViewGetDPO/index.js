import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import planViewService from '../services/planview/planview.service.js';

const planViewGetDpo = async (context, req) => {
  const data = await planViewService.getDPO(req.query?.['apmId']);
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(planViewGetDpo, ['GET']);