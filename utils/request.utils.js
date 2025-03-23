import { CONNECTION_TYPE } from '../types/connection.type.js';
import { LEGAL_ENTITY_TYPE } from '../types/legalEntity.type.js';

const {
  REQUEST_ID,
  DOMAIN_NAME,
  ENTITY_NAME,
} = CONNECTION_TYPE;

const buildConnections = (connections, requestId) => {
  return Object.entries(connections).map(([domainName, entities]) => {
    return entities.map(entity => {
      return {
        [DOMAIN_NAME]: domainName,
        [ENTITY_NAME]: entity,
        [REQUEST_ID]: requestId,
      };
    });
  })?.flat();
};

const buildLegalEntities = (legalEntities, requestId) => {
  return legalEntities.map(entity => {
    return {
      ...entity,
      [LEGAL_ENTITY_TYPE.REQUEST_ID]: requestId,
    };
  });
};

const groupLegalEntitiesByDataOwner = (legalEntities) => {
  return legalEntities.reduce((acc, entity) => {
    const dataOwner = entity[LEGAL_ENTITY_TYPE.DATA_OWNER];
    if (!acc[dataOwner]) {
      acc[dataOwner] = [];
    }
    acc[dataOwner].push(entity);
    return acc;
  }, {});
};

const utils = {
  buildConnections,
  buildLegalEntities,
  groupLegalEntitiesByDataOwner,
};

export default utils;