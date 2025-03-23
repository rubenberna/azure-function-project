import { Op } from 'sequelize';
import DomainModel from '../../models/domain.model.js';
import DbbObjectModel from '../../models/dbbObject.model.js';
import { getDpInstance } from '../../../config/server.config.js';
import { DBB_OBJECT_TYPE } from '../../../types/dbbObject.type.js';
import { DOMAIN_TYPE } from '../../../types/domain.type.js';

const getDomains = async () => {
  const dpInstance = await getDpInstance();
  const DOMAIN_MODEL = DomainModel(dpInstance);
  return DOMAIN_MODEL.findAll({
    order: [DOMAIN_TYPE.Domain_Target],
  });
};

const getDomainsWithNames = async ({ Domain_Target }) => {
  const dpInstance = await getDpInstance();
  const DOMAIN_MODEL = DomainModel(dpInstance);
  return DOMAIN_MODEL.findAll({
    where: {
      [DOMAIN_TYPE.Domain_Target]: Domain_Target
    },
    order: [DOMAIN_TYPE.Domain_Target],
  });
};

const getEntitiesFromDomain = async (domainsIds) => {
  const dpInstance = await getDpInstance();
  const DBB_OBJECT = DbbObjectModel(dpInstance);
  return DBB_OBJECT.findAll({
    where: {
      [DBB_OBJECT_TYPE.Domain_ID]: {
        [Op.in]: domainsIds,
      }
    },
    order: [DBB_OBJECT_TYPE.Object_Name],
  });
};

const queries = {
  getDomains,
  getEntitiesFromDomain,
  getDomainsWithNames
};

export default queries;