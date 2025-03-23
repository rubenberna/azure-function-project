import { REQUEST_TYPE } from '../types/request.type.js';
import requestConsts from '../consts/request.consts.js';


const {
  APMID,
  APM_SHORT_NAME,
  TARGET_ENVS,
  TARGET_DB_NAMES,
  EXPLORATION_PURPOSE,
  ORIGIN_ENVS,
  LEGAL_APPROVER,
  LEGAL_APPROVAL_TYPE,
  DPO,
  FILTERS,
  ASSIGNED_DATA_ENGINEER,
  CREATED_BY,
  REQUEST_ID,
  INSERT_TIMESTAMP
} = REQUEST_TYPE;


const {
  TARGET,
  SECURITY,
  _FILTERS,
  ORIGIN,
  STATUS,
  _ASSIGNED_DATA_ENGINEER,
  GENERAL_DETAILS
} = requestConsts.SECTION_LABELS;

const groupConnectionsByDomain = (connections) => {
  return connections.reduce((acc, connection) => {
    const { DOMAIN_NAME, ENTITY_NAME } = connection;
    if (!acc[DOMAIN_NAME]) {
      acc[DOMAIN_NAME] = [];
    }
    acc[DOMAIN_NAME].push(ENTITY_NAME);
    return acc;
  }, {});
};

const RequestBuilder = (() => {
  
  const _prepareTarget = (requestDetails) => {
    return {
      [APMID]: requestDetails[APMID],
      [APM_SHORT_NAME]: requestDetails[APM_SHORT_NAME],
      [DPO]: requestDetails[DPO],
      [TARGET_ENVS]: JSON.parse(requestDetails[TARGET_ENVS]),
      [TARGET_DB_NAMES]: JSON.parse(requestDetails[TARGET_DB_NAMES]),
      [EXPLORATION_PURPOSE]: requestDetails[EXPLORATION_PURPOSE]
    };
  };
  
  const _prepareOrigin = (requestDetails, connections) => {
    return {
      [ORIGIN_ENVS]: JSON.parse(requestDetails[ORIGIN_ENVS]),
      ['DOMAIN_ENTITIES']: groupConnectionsByDomain(connections) // Needs some transformation
    };
  };
  
  const _prepareSecurity = (requestDetails, legalEntities, attachments) => {
    return {
      [LEGAL_APPROVAL_TYPE]: requestDetails[LEGAL_APPROVAL_TYPE],
      [LEGAL_APPROVER]: requestDetails[LEGAL_APPROVER],
      [DPO]: requestDetails[DPO],
      ['LEGAL_ENTITIES']: legalEntities,
      ['LEGAL_APPROVAL_PROOF']: attachments?.map(attachment => ({ name: attachment.FILE_NAME, ...attachment }))
    };
  };
  
  const _prepareFilters = (requestDetails) => {
    return {
      [FILTERS]: requestDetails[FILTERS]
    };
  };
  
  const _prepareGeneralDetails = (requestDetails, dataEngineerUsername) => {
    return {
      [REQUEST_ID]: requestDetails[REQUEST_ID],
      [CREATED_BY]: requestDetails[CREATED_BY],
      [EXPLORATION_PURPOSE]: requestDetails[EXPLORATION_PURPOSE],
      [INSERT_TIMESTAMP]: requestDetails[INSERT_TIMESTAMP],
      [ASSIGNED_DATA_ENGINEER]: dataEngineerUsername,
      [DPO]: requestDetails[DPO],
    };
  };
  
  const buildRequest = (params) => {
    const {
      requestDetails,
      connections,
      legalEntities,
      attachments,
      latestStatus,
      dataEngineerUsername
    } = params;
    
    return {
      [_ASSIGNED_DATA_ENGINEER]: {
        [ASSIGNED_DATA_ENGINEER]: requestDetails[ASSIGNED_DATA_ENGINEER] ?? null
      },
      [TARGET]: _prepareTarget(requestDetails),
      [ORIGIN]: _prepareOrigin(requestDetails, connections),
      [SECURITY]: _prepareSecurity(requestDetails, legalEntities, attachments),
      [_FILTERS]: _prepareFilters(requestDetails),
      [STATUS]: latestStatus,
      [GENERAL_DETAILS]: _prepareGeneralDetails(requestDetails, dataEngineerUsername)
    };
  };
  
  return {
    buildRequest
  };
})();

const getUniqueArrayOfObjects = (data, key) => {
  return [...new Map(data?.map(item => {
    return [item[key], item];
  })).values()];
};


const utils = {
  RequestBuilder,
  getUniqueArrayOfObjects
};

export default utils;