import { getDpInstance } from '../../../config/server.config.js';
import attachmentModel from '../../models/attachment.model.js';
import { ATTACHMENT_TYPE } from '../../../types/attachment.type.js';

const {
  FILE_LOCATION, FILE_NAME
} = ATTACHMENT_TYPE;

const createAttachment = async (attachment) => {
  const dpInstance = await getDpInstance();
  const ATTACHMENT_MODEL = attachmentModel(dpInstance);
  return ATTACHMENT_MODEL.create(attachment);
};

const getAttachmentsFromRequest = async (params, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const ATTACHMENT_MODEL = attachmentModel(dpInstance);
  return await ATTACHMENT_MODEL.findAll({
    attributes: [FILE_NAME, FILE_LOCATION],
    where: {
      REQUEST_ID: params.REQUEST_ID,
    },
    raw: true, // removes sequelize metadata
  });
};

const queries = {
  createAttachment,
  getAttachmentsFromRequest
};

export default queries;