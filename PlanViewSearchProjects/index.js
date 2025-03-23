import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import planViewService from '../services/planview/planview.service.js';

const planViewSearchProjects = async (context, req) => {
  const data = await planViewService.searchProjects(req.query?.['searchTerm']);
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(planViewSearchProjects, ['GET']);