import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import dataEngineersService from '../services/dataportal/dataEngineers.service.js';

const getAllDataEngineers = async (context) => {
  const data = await dataEngineersService.getAllDataEngineers();
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(getAllDataEngineers, ['GET']);