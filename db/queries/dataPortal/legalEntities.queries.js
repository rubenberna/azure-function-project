import { getDpInstance } from '../../../config/server.config.js';
import legalEntityModel from '../../models/legalEntity.model.js';
import { LEGAL_ENTITY_TYPE } from '../../../types/legalEntity.type.js';

const {
  LEGAL_ENTITY_NAME,
  LEGAL_ENTITY_CODE,
  APPROVED_BY_DATA_OWNER,
  DATA_OWNER,
  REQUEST_ID
} = LEGAL_ENTITY_TYPE;

const createLegalEntities = async (legalEntities) => {
  const dpInstance = await getDpInstance();
  const LEGAL_ENTITY_MODEL = legalEntityModel(dpInstance);
  return await LEGAL_ENTITY_MODEL.bulkCreate(legalEntities);
};

const getLegalEntitiesFromRequest = async (params, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const LEGAL_ENTITY_MODEL = legalEntityModel(dpInstance);
  return await LEGAL_ENTITY_MODEL.findAll({
    attributes: [LEGAL_ENTITY_NAME, LEGAL_ENTITY_CODE, DATA_OWNER, APPROVED_BY_DATA_OWNER],
    where: {
      REQUEST_ID: params.REQUEST_ID,
      IS_ACTIVE: 1
    }
  });
};

const checkIfUserIsDataOwner = async (username, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const LEGAL_ENTITY_MODEL = legalEntityModel(dpInstance);
  return await LEGAL_ENTITY_MODEL.findOne({
    where: {
      DATA_OWNER: username,
      IS_ACTIVE: 1
    }
  });
};

const getDataApprovers = async (requestId, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  return await dpInstance.query(`
      SELECT
  DATA_OWNER,
  APPROVED_BY_DATA_OWNER
  FROM [PROVISIONING].[LEGAL_ENTITIES]
  WHERE REQUEST_ID = :requestId AND IS_ACTIVE = 1
  GROUP BY DATA_OWNER, APPROVED_BY_DATA_OWNER
  `, {
    type: dpInstance.QueryTypes.SELECT,
    replacements: { requestId }
  });
};

const approveLegalEntities = async (requestId, dataOwner, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const LEGAL_ENTITY_MODEL = legalEntityModel(dpInstance);
  
  return LEGAL_ENTITY_MODEL.update({
    [APPROVED_BY_DATA_OWNER]: 1,
  }, {
    where: {
      [DATA_OWNER]: dataOwner,
      [REQUEST_ID]: requestId,
    }
  });
};

const areAllLegalEntitiesApproved = async (requestId, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const LEGAL_ENTITY_MODEL = legalEntityModel(dpInstance);
  return await LEGAL_ENTITY_MODEL.findAll({
    where: {
      REQUEST_ID: requestId,
      APPROVED_BY_DATA_OWNER: 0,
      IS_ACTIVE: 1
    }
  });
};

const queries = {
  createLegalEntities,
  getLegalEntitiesFromRequest,
  checkIfUserIsDataOwner,
  getDataApprovers,
  approveLegalEntities,
  areAllLegalEntitiesApproved
};

export default queries;