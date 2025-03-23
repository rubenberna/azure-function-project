import Busboy from '@fastify/busboy';
import blobStorageUtil from '../../utils/blobStorage.util.js';
import attachmentsQueries from '../../db/queries/dataPortal/attachments.queries.js';
import { ATTACHMENT_TYPE } from '../../types/attachment.type.js';
import validationsUtil from '../../utils/validations.util.js';

const uploadToStorage = async (req) => {
  const content = req.body;
  const headers = req.headers;
  validationsUtil.validateRequiredParams(['request-id', 'filename'], headers);
  if (!headers?.['content-type']?.includes('boundary')) {
    const filePath = await blobStorageUtil.uploadBlob(content, headers);
    await attachmentsQueries.createAttachment({
      [ATTACHMENT_TYPE.FILE_LOCATION]: filePath,
      [ATTACHMENT_TYPE.FILE_NAME]: headers.filename,
      [ATTACHMENT_TYPE.REQUEST_ID]: headers['request-id'],
    });
  }
  return new Promise((resolve, reject) => {
    const bb = new Busboy({ headers });
    const fileChunks = [];
    
    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', (data) => {
        fileChunks.push(data); // Add each chunk to the array
      });
      
      file.on('end', async () => {
        const fileBuffer = Buffer.concat(fileChunks);
        try {
          const clonedHeaders = { ...headers };
          clonedHeaders['content-type'] = mimetype;
          const filePath = await blobStorageUtil.uploadBlob(fileBuffer, clonedHeaders);
          await attachmentsQueries.createAttachment({
            [ATTACHMENT_TYPE.FILE_LOCATION]: filePath,
            [ATTACHMENT_TYPE.FILE_NAME]: filename,
            [ATTACHMENT_TYPE.REQUEST_ID]: headers['request-id'],
          });
          resolve(filePath);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    bb.on('error', (error) => {
      console.error('Error parsing file upload:', error);
      reject(error);
    });
    const requestBody = Buffer.isBuffer(req) ? content : Buffer.from(content);
    bb.end(requestBody);
  });
};

const downloadAttachment = async (fileName) => {
  if (!fileName) {
    throw new Error('fileName is required');
  }
  const decodedUrl = decodeURIComponent(fileName);
  return await blobStorageUtil.downloadAttachment(decodedUrl);
};

const service = {
  uploadToStorage,
  downloadAttachment
};

export default service;
