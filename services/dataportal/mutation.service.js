import { getDpInstance } from '../../config/server.config.js';
import validationsUtil from '../../utils/validations.util.js';
import statusLogsQueries from '../../db/queries/dataPortal/statusTracker.queries.js';
import { STATUS_TRACKER_TYPE } from '../../types/statusTracker.type.js';
import statusQueries from '../../db/queries/dataPortal/status.queries.js';
import requestConsts from '../../consts/request.consts.js';
import { STATUS_ENUM_TYPE } from '../../types/status.type.js';
import requestQueries from '../../db/queries/dataPortal/request.queries.js';
import { REQUEST_TYPE } from '../../types/request.type.js';
import emailService from '../email/email.service.js';
import legalEntitiesQueries from '../../db/queries/dataPortal/legalEntities.queries.js';
import adminQueries from '../../db/queries/dataPortal/admin.queries.js';
import { ADMIN_TYPE } from '../../types/admin.type.js';
import { findOrCreateDataEngineer } from '../../db/queries/dataPortal/dataEngineer.queries.js';
import { DATA_ENGINEER_TYPE } from '../../types/dataEngineer.type.js';
import devopsService from '../devops/devops.service.js';

const {
  DECLINED_BY_DATA_OWNERS,
  APPROVED_BY_DATA_OWNERS,
  DECLINED_BY_DPO,
  APPROVED_BY_DPO,
  ASSIGNED_DATA_ENGINEER,
  COMPLETED,
  CANCELLED_BY_REQUESTER,
  CANCELLED_BY_ADMIN
} = requestConsts.STATUS_ENUM_NAMES;

const declineByDataOwner = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID'], params);
  const dpInstance = await getDpInstance();
  const statusIds = await statusQueries.getStatusByNames([DECLINED_BY_DATA_OWNERS]);
  const declinedByDOStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  const requestDetails = await requestQueries.getRequest({ REQUEST_ID: params.REQUEST_ID }, dpInstance, [REQUEST_TYPE.CREATED_BY, REQUEST_TYPE.APMID]);
  
  await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: declinedByDOStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
  });
  
  return await emailService.dataOwnerDeclinedRequest({
    ...requestDetails,
    ...params,
    dataOwner: params.USER
  });
};

const approvedByDataOwner = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID'], params);
  const dpInstance = await getDpInstance();
  await legalEntitiesQueries.approveLegalEntities(params.REQUEST_ID, params.USER, dpInstance);
  const legalEntitiesLeftToApprove = await legalEntitiesQueries.areAllLegalEntitiesApproved(params.REQUEST_ID, dpInstance);
  
  if (!legalEntitiesLeftToApprove?.length) {
    const statusIds = await statusQueries.getStatusByNames([APPROVED_BY_DATA_OWNERS]);
    const approvedStatus = statusIds[0][STATUS_ENUM_TYPE.ID];
    
    await statusLogsQueries.createStatusLog({
      [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
      [STATUS_TRACKER_TYPE.STATUS_ID]: approvedStatus,
      [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
    });
    
    const requestDetails = await requestQueries.getRequest({ REQUEST_ID: params.REQUEST_ID }, dpInstance, [REQUEST_TYPE.CREATED_BY, REQUEST_TYPE.APMID, REQUEST_TYPE.DPO]);
    await emailService.dataOwnersApprovedRequest({
      ...requestDetails,
      ...params
    });
    
    return await emailService.informDPO({
      ...requestDetails,
      ...params
    });
  }
};

const declineByDPO = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID'], params);
  const dpInstance = await getDpInstance();
  const statusIds = await statusQueries.getStatusByNames([DECLINED_BY_DPO]);
  const declinedByDPOStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  
  await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: declinedByDPOStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
  });
  
  const requestDetails = await requestQueries.getRequest({ REQUEST_ID: params.REQUEST_ID }, dpInstance, [REQUEST_TYPE.CREATED_BY, REQUEST_TYPE.APMID]);
  
  return await emailService.dpoDeclinedRequest({
    ...params,
    ...requestDetails,
    DPO: params.USER
  });
};

const approvedByDPO = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID'], params);
  const statusIds = await statusQueries.getStatusByNames([APPROVED_BY_DPO]);
  const approvedByDPOStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  const dpInstance = await getDpInstance();
  
  await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: approvedByDPOStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
  });
  
  const requestDetails = await requestQueries.getRequest({ REQUEST_ID: params.REQUEST_ID }, dpInstance, [REQUEST_TYPE.CREATED_BY, REQUEST_TYPE.APMID]);
  const allAdmins = await adminQueries.getAllAdmins();
  const adminEmails = allAdmins.map(admin => admin[ADMIN_TYPE.USERNAME]);
  
  await emailService.informRequesterDPOApprovedRequest({
    ...params,
    ...requestDetails,
    DPO: params.USER
  });
  
  return await emailService.informAdminsOfNewRequest({
    ...params,
    ...requestDetails,
    ADMINS: adminEmails
  });
};

const assignDataEngineer = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID', 'ASSIGNED_DATA_ENGINEER'], params);
  const dpInstance = await getDpInstance();
  const statusIds = await statusQueries.getStatusByNames([ASSIGNED_DATA_ENGINEER]);
  const assignedToDataEngineerStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  
  const requestDetails = await requestQueries.getRequest({ REQUEST_ID: params.REQUEST_ID }, dpInstance, [REQUEST_TYPE.CREATED_BY, REQUEST_TYPE.APMID]);
  const dataEngineerId = (await findOrCreateDataEngineer(params.ASSIGNED_DATA_ENGINEER, dpInstance))[0]?.[DATA_ENGINEER_TYPE.ID];
  await requestQueries.assignDataEngineer({
    REQUEST_ID: params.REQUEST_ID,
    ASSIGNED_DATA_ENGINEER: dataEngineerId,
    UPDATED_BY: params.USER
  }, dpInstance);
  
  await devopsService.createTicket({ ...requestDetails, ...params });
  await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: assignedToDataEngineerStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
  });
  
  await emailService.assignDataEngineer({
    ...params,
    ...requestDetails
  });
  
  return await emailService.informUserRequestWasAssigned({
    ...params,
    ...requestDetails
  });
};

const completeRequest = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID'], params);
  const statusIds = await statusQueries.getStatusByNames([COMPLETED]);
  const completedStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  
  await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: completedStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
  });
  const dpInstance = await getDpInstance();
  const requestDetails = await requestQueries.getRequest({ REQUEST_ID: params.REQUEST_ID }, dpInstance, [REQUEST_TYPE.CREATED_BY, REQUEST_TYPE.APMID]);
  
  return await emailService.informUserRequestComplete({
    ...params,
    ...requestDetails
  });
};

const cancelledByRequester = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID'], params);
  const statusIds = await statusQueries.getStatusByNames([CANCELLED_BY_REQUESTER]);
  const canceledByRequesterStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  
  return await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: canceledByRequesterStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
  });
};

const cancelledByAdmin = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID'], params);
  const statusIds = await statusQueries.getStatusByNames([CANCELLED_BY_ADMIN]);
  const canceledByAdminStatusId = statusIds[0][STATUS_ENUM_TYPE.ID];
  
  await statusLogsQueries.createStatusLog({
    [STATUS_TRACKER_TYPE.REQUEST_ID]: params.REQUEST_ID,
    [STATUS_TRACKER_TYPE.STATUS_ID]: canceledByAdminStatusId,
    [STATUS_TRACKER_TYPE.CREATED_BY]: params.USER,
  });
  
  const dpInstance = await getDpInstance();
  const requestDetails = await requestQueries.getRequest({ REQUEST_ID: params.REQUEST_ID }, dpInstance, [REQUEST_TYPE.CREATED_BY, REQUEST_TYPE.APMID]);
  
  return await emailService.informUserRequestCancelledByAdmin({
    ...params,
    ...requestDetails,
    ADMIN: params.USER
  });
};

const mutateRequest = async (params) => {
  validationsUtil.validateRequiredParams(['USER', 'REQUEST_ID', 'STATUS_NAME'], params);
  switch (params['STATUS_NAME']) {
    case DECLINED_BY_DATA_OWNERS:
      return await declineByDataOwner(params);
    case APPROVED_BY_DATA_OWNERS:
      return await approvedByDataOwner(params);
    case DECLINED_BY_DPO:
      return await declineByDPO(params);
    case APPROVED_BY_DPO:
      return await approvedByDPO(params);
    case ASSIGNED_DATA_ENGINEER:
      return await assignDataEngineer(params);
    case COMPLETED:
      return await completeRequest(params);
    case CANCELLED_BY_REQUESTER:
      return await cancelledByRequester(params);
    case CANCELLED_BY_ADMIN:
      return await cancelledByAdmin(params);
    default:
      throw new Error('Invalid status name');
  }
};

const service = {
  mutateRequest
};

export default service;