import mime from 'mime-types';
import errorHandlingMiddleware from '../middleware/errorHandling.middleware.js';
import storageService from '../services/storage/storage.service.js';

const downloadAttachment = async (context, req) => {
  const fileName = req.query?.fileName;
  const data = await storageService.downloadAttachment(fileName);
  const mimeType = mime.lookup(fileName) || 'application/octet-stream';
  context.res = {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': mimeType
    },
    body: data
  };
};

export default errorHandlingMiddleware(downloadAttachment, ['GET']);