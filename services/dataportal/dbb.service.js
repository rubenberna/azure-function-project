import validationsUtil from '../../utils/validations.util.js';
import dbbQueries from '../../db/queries/dataPortal/dbb.queries.js';
import requestUtil from '../../utils/request.util.js';
import { DOMAIN_TYPE } from '../../types/domain.type.js';

const getDomains = async () => {
  const data = await dbbQueries.getDomains();
  return requestUtil.getUniqueArrayOfObjects(data, DOMAIN_TYPE.Domain_Target);
};

const getEntitiesFromDomain = async (params) => {
  validationsUtil.validateRequiredParams([DOMAIN_TYPE.Domain_Target], params);
  const domainsIds = (await dbbQueries.getDomainsWithNames(params))?.map(domain => domain[DOMAIN_TYPE.Domain_ID]);
  if (!domainsIds) {
    return [];
  }
  return await dbbQueries.getEntitiesFromDomain(domainsIds);
};

const services = {
  getDomains,
  getEntitiesFromDomain
};

export default services;