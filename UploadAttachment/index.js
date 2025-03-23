import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import storageService from '../services/storage/storage.service.js';

const uploadAttachments = async (context, req) => {
  const data = await storageService.uploadToStorage(req);
  context.res = {
    status: 200,
    body: data
  };
};

export default errorHandlingMiddleware(uploadAttachments, ['POST']);