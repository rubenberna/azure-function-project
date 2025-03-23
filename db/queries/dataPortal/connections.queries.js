import { getDpInstance } from '../../../config/server.config.js';
import connectionModel from '../../models/connection.model.js';
import { CONNECTION_TYPE } from '../../../types/connection.type.js';

const {
  DOMAIN_NAME,
  ENTITY_NAME,
  APPROVED_BY_DPO
} = CONNECTION_TYPE;

const createConnections = async (connections) => {
  const dpInstance = await getDpInstance();
  const CONNECTION_MODEL = connectionModel(dpInstance);
  return await CONNECTION_MODEL.bulkCreate(connections);
};

const getRequestConnections = async (params, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const CONNECTION_MODEL = connectionModel(dpInstance);
  
  return await CONNECTION_MODEL.findAll({
    attributes: [DOMAIN_NAME, ENTITY_NAME, APPROVED_BY_DPO],
    where: {
      REQUEST_ID: params.REQUEST_ID,
      IS_ACTIVE: 1
    }
  });
};

const queries = {
  createConnections,
  getRequestConnections
};

export default queries;