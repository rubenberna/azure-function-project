import { getDpInstance } from '../../../config/server.config.js';
import adminModel from '../../models/admin.model.js';
import { ADMIN_TYPE } from '../../../types/admin.type.js';

const getAdmin = async (username, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const ADMIN_MODEL = adminModel(dpInstance);
  return await ADMIN_MODEL.findOne({
    where: {
      [ADMIN_TYPE.USERNAME]: username
    }
  });
};

const getAllAdmins = async (sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const ADMIN_MODEL = adminModel(dpInstance);
  return await ADMIN_MODEL.findAll();
};

const queries = {
  getAdmin,
  getAllAdmins
};

export default queries;