import userConsts from '../../consts/user.consts.js';
import adminQueries from '../../db/queries/dataPortal/admin.queries.js';
import legalEntitiesQueries from '../../db/queries/dataPortal/legalEntities.queries.js';
import validationsUtil from '../../utils/validations.util.js';
import { getDpInstance } from '../../config/server.config.js';
import requestQueries from '../../db/queries/dataPortal/request.queries.js';
import dataEngineerQueries from '../../db/queries/dataPortal/dataEngineer.queries.js';

const { POSSIBLE_PROFILES } = userConsts;
const getUserProfile = async (username) => {
  validationsUtil.validateRequiredParams(['username'], { username });
  // check if user is Admin
  const dpInstance = await getDpInstance();
  const isAdmin = await adminQueries.getAdmin(username, dpInstance);
  if (isAdmin) {
    return POSSIBLE_PROFILES.ADMIN;
  }
  // check if user is Data Owner
  const isDataOwner = await legalEntitiesQueries.checkIfUserIsDataOwner(username, dpInstance);
  if (isDataOwner) {
    return POSSIBLE_PROFILES.DATA_OWNER;
  }
  
  // check if user is DPO
  const isDPO = await requestQueries.checkIfUserIsDpo(username, dpInstance);
  if (isDPO) {
    return POSSIBLE_PROFILES.DPO;
  }
  
  // check if user is Data Engineer
  const isDataEngineer = await dataEngineerQueries.getDataEngineer(username, dpInstance);
  if (isDataEngineer) {
    return POSSIBLE_PROFILES.DATA_ENGINEER;
  }
  return POSSIBLE_PROFILES.REGULAR_USER;
};

const service = {
  getUserProfile
};

export default service;