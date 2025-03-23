import { Op } from 'sequelize';
import { getDpInstance } from '../../../config/server.config.js';
import statusModel from '../../models/status.model.js';
import { STATUS_ENUM_TYPE } from '../../../types/status.type.js';

const getStatusByNames = async (statusNames) => {
  const dpInstance = await getDpInstance();
  const STATUS_ENUM = statusModel(dpInstance);
  return await STATUS_ENUM.findAll({
    where: {
      [STATUS_ENUM_TYPE.NAME]: {
        [Op.in]: statusNames
      }
    }
  });
};

const queries = {
  getStatusByNames
};

export default queries;