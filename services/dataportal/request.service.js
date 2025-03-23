import validationsUtil from '../../utils/validations.util.js';
import { REQUEST_TYPE } from '../../types/request.type.js';
import requestUtils from '../../utils/request.utils.js';
import emailService from '../email/email.service.js';
import statusQueries from '../../db/queries/dataPortal/status.queries.js';
import requestConsts from '../../consts/request.consts.js';
import { STATUS_ENUM_TYPE } from '../../types/status.type.js';
import statusLogsQueries from '../../db/queries/dataPortal/statusTracker.queries.js';
import { STATUS_TRACKER_TYPE } from '../../types/statusTracker.type.js';
import requestQueries from '../../db/queries/dataPortal/request.queries.js';
import connectionsQueries from '../../db/queries/dataPortal/connections.queries.js';
import legalEntitiesQueries from '../../db/queries/dataPortal/legalEntities.queries.js';
import requestUtil from '../../utils/request.util.js';
import attachmentsQueries from '../../db/queries/dataPortal/attachments.queries.js';
import { getDpInstance } from '../../config/server.config.js';
import dataEngineerQueries from '../../db/queries/dataPortal/dataEngineer.queries.js';
import { DATA_ENGINEER_TYPE } from '../../types/dataEngineer.type.js';
import adminQueries from '../../db/queries/dataPortal/admin.queries.js';

const createRequest = async (params) => {
  validationsUtil.validateRequiredParams(['request', 'connections', 'legalEntities', REQUEST_TYPE.CREATED_BY], params);
  const { REQUEST_ID } = await requestQueries.createRequest({
    ...params.request,
    [REQUEST_TYPE.TARGET_DB_NAMES]: JSON.stringify(params.request[REQUEST_TYPE.TARGET_DB_NAMES]),
    [REQUEST_TYPE.ORIGIN_ENVS]: JSON.stringify(params.request[REQUEST_TYPE.ORIGIN_ENVS]),
    [REQUEST_TYPE.TARGET_ENVS]: JSON.stringify(params.request[REQUEST_TYPE.TARGET_ENVS]),
    [REQUEST_TYPE.CREATED_BY]: params[REQUEST_TYPE.CREATED_BY],
    [REQUEST_TYPE.EXPLORATION_PURPOSE]: params.request[REQUEST_TYPE.EXPLORATION_PURPOSE]?.toLowerCase() === 'no' ? 0 : 1,
  });
  
  const connections = requestUtils.buildConnections(params.connections, REQUEST_ID);
  await connectionsQueries.createConnections(connections);
  
  const legalEntities = requestUtils.buildLegalEntities(params['legalEntities'], REQUEST_ID);
  await legalEntitiesQueries.createLegalEntities(legalEntities);
  
  const statusIds = await statusQueries.getStatusByNames([requestConsts.STATUS_ENUM_NAMES.REQUESTED, requestConsts.STATUS_ENUM_NAMES.PENDING_DATA_OWNERS]);
  const requestStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  const pendingDataOwnersStatusId = statusIds[1][STATUS_ENUM_TYPE.ID];
  
  await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: requestStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params[REQUEST_TYPE.CREATED_BY],
  });
  const groupedLegalEntities = requestUtils.groupLegalEntitiesByDataOwner(params['legalEntities']);
  
  const emailPromises = Object.entries(groupedLegalEntities).map(async ([dataOwner, legalEntities]) => {
    return emailService.communicateNewRequestToDataOwner({
      dataOwner,
      legalEntities,
      requestDetails: params.request,
      REQUEST_ID,
      CREATED_BY: params[REQUEST_TYPE.CREATED_BY]
    });
  });
  
  await Promise.all(emailPromises);
  
  return await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: pendingDataOwnersStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params[REQUEST_TYPE.CREATED_BY],
  });
};

const getUserPendingAdminRequests = async (params) => {
  validationsUtil.validateRequiredParams(['username'], params);
  return await requestQueries.getUserPendingAdminRequests(params.username);
};

const getRequest = async (params) => {
  validationsUtil.validateRequiredParams(['REQUEST_ID'], params);
  const dpInstance = await getDpInstance();
  
  const requestDetails = await requestQueries.getRequest(params, dpInstance);
  console.log(requestDetails);
  const connections = await connectionsQueries.getRequestConnections(params, dpInstance);
  const legalEntities = await legalEntitiesQueries.getLegalEntitiesFromRequest(params, dpInstance);
  const attachments = await attachmentsQueries.getAttachmentsFromRequest(params, dpInstance);
  const latestStatus = (await statusLogsQueries.getLatestStatusFromRequest(params, dpInstance))?.[0];
  let dataEngineerUsername;
  
  if (requestDetails[REQUEST_TYPE.ASSIGNED_DATA_ENGINEER]) {
    dataEngineerUsername = (await dataEngineerQueries.getDataEngineerById(requestDetails[REQUEST_TYPE.ASSIGNED_DATA_ENGINEER], dpInstance))?.[DATA_ENGINEER_TYPE.DATA_ENGINEER];
  }
  
  return requestUtil.RequestBuilder.buildRequest({
    requestDetails,
    connections,
    legalEntities,
    attachments,
    latestStatus,
    dataEngineerUsername
  });
};

const getMyRequests = async (params) => {
  validationsUtil.validateRequiredParams(['username'], params);
  const dpInstance = await getDpInstance();
  return await requestQueries.getMyRequests(params, dpInstance);
};

const getDataApprovers = async (params) => {
  validationsUtil.validateRequiredParams(['REQUEST_ID'], params);
  return await legalEntitiesQueries.getDataApprovers(params.REQUEST_ID);
};


const getDERequests = async (params) => {
  validationsUtil.validateRequiredParams(['username'], params);
  const dpInstance = await getDpInstance();
  const engineer = await dataEngineerQueries.getDataEngineer(params.username, dpInstance);
  if (!engineer) {
    return [];
  }
  const engineerId = engineer[DATA_ENGINEER_TYPE.ID];
  return await requestQueries.getDERequests({ engineerId, ...params }, dpInstance);
};

const getAdminRequests = async (params) => {
  validationsUtil.validateRequiredParams(['username'], params);
  const dpInstance = await getDpInstance();
  const userIsAdmin = await adminQueries.getAdmin(params.username, dpInstance);
  if (!userIsAdmin) {
    throw new Error('User is not an admin');
  }
  return await requestQueries.getAdminRequests(params, dpInstance);
};

const getApprovalRequestsForUser = async (params) => {
  validationsUtil.validateRequiredParams(['username'], params);
  return await requestQueries.getApprovalRequestsForUser(params.username);
};

const service = {
  createRequest,
  getUserPendingAdminRequests,
  getRequest,
  getMyRequests,
  getDataApprovers,
  getDERequests,
  getAdminRequests,
  getApprovalRequestsForUser
};

export default service;