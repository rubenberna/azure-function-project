import { EmailService } from 'email-service';
import validationsUtil from '../../utils/validations.util.js';
import { REQUEST_TYPE } from '../../types/request.type.js';
import emailUtils from '../../utils/email.utils.js';

const DEBUG_EMAIL = 'ruben.bernardes@consultant.volvo.com';

const _sendEmail = async (params) => {
  validationsUtil.validateRequiredParams(['recipients', 'subject', 'body'], params);
  const { recipients, subject, body } = params;
  
  return EmailService.sendEmail({
    recipients,
    subject,
    htmlBody: `
    <p>Hi,</p>
    <p>${body}</p>
    <p>Kind regards,</p>
    <p>Data Portal team</p>
    `
  });
};

const communicateNewRequestToDataOwner = async (params) => {
  const {
    dataOwner,
    legalEntities,
    requestDetails,
    CREATED_BY,
    REQUEST_ID
  } = params;
  const ponds = requestDetails[REQUEST_TYPE.TARGET_DB_NAMES]
    ?.map(pond => `<span style="background: #F9F9F9; padding: 3px 9px; border-radius: 5px; margin: 0 3px">${pond}</span>`)
    .join(', ');
  const emailBody = `
    <p>The user ${CREATED_BY} made a new <strong>Provisioning request</strong> for the pond(s) ${ponds} using data from your region's Legal Entities: </p>
    ${emailUtils.generateList(legalEntities)}
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}?</p>
  `;
  
  return await _sendEmail({
    recipients: [dataOwner],
    subject: 'New Provisioning Request',
    body: emailBody
  });
};

const dataOwnerDeclinedRequest = async ({ CREATED_BY, APMID, REQUEST_ID, dataOwner }) => {
  const emailBody = `
    <p>The <strong>data owner</strong> ${dataOwner} declined access to the Legal Entities of his region to be used on your provisioning request for the APMID <strong>${APMID}</strong>.</p>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [CREATED_BY],
    subject: 'Data Owner Declined Request',
    body: emailBody
  });
};

const dataOwnersApprovedRequest = async ({ CREATED_BY, APMID, REQUEST_ID }) => {
  const emailBody = `
    <p>The <strong>data owner(s)</strong> accepted using their regions' data for your provisioning request for the APMID <strong>${APMID}</strong>.</p>
    <p><strong>Next Steps:</strong></p>
    <li>The DPO of the project will need to accept the provisionig request.</li>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [CREATED_BY],
    subject: 'Data Owners Accepted Request',
    body: emailBody
  });
};

const informDPO = async ({ DPO, APMID, REQUEST_ID }) => {
  const emailBody = `
    <p>There's a new provisioning request for the APMID <strong>${APMID}</strong> awaiting your approval.</p>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [DPO],
    subject: 'Data Provisioning Request Approval',
    body: emailBody
  });
};

const dpoDeclinedRequest = async ({ CREATED_BY, APMID, REQUEST_ID, DPO }) => {
  const emailBody = `
    <p>The <strong>DPO</strong> from the APMID <strong>${APMID}</strong> (${DPO}) declined your provisioning request.</p>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [CREATED_BY],
    subject: 'DPO Declined Request',
    body: emailBody
  });
};

const informRequesterDPOApprovedRequest = async ({ CREATED_BY, APMID, REQUEST_ID, DPO }) => {
  const emailBody = `
    <p>Your provisioning request for the APMID <strong>${APMID}</strong> has been accepted by the DPO (email: ${DPO}).</p>
    <p><strong>Next Steps:</strong></p>
    <li>A Data Engineer will be assigned shortly to work on your request.</li>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [CREATED_BY],
    subject: 'DPO Accepted Request',
    body: emailBody
  });
};

const informAdminsOfNewRequest = async ({ ADMINS, APMID, REQUEST_ID }) => {
  const emailBody = `
    <p>The Provisioning <strong>Request Id ${REQUEST_ID}</strong> concerning the APMID ${APMID} has been <strong>approved</strong> by both the Regional Data Owners and respective DPO.</p>
    <p><strong>Next Steps:</strong></p>
    <li>Please assign a Data Engineer to fulfill this request.</li>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: ADMINS,
    subject: 'Data Provisioning: Assign Data Engineer',
    body: emailBody
  });
};

const assignDataEngineer = async ({ REQUEST_ID, ASSIGNED_DATA_ENGINEER }) => {
  const emailBody = `
    <p>The Data Provisioning request with the ID ${REQUEST_ID} has been assigned to you.</p>
    <p><strong>Next Steps:</strong></p>
    <li>Mark this task as 'Complete' once the request has been fulfilled.</li>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [ASSIGNED_DATA_ENGINEER],
    subject: 'Data Provisioning Request: assigned to you',
    body: emailBody
  });
};

const informUserRequestWasAssigned = async ({ APMID, REQUEST_ID, CREATED_BY }) => {
  const emailBody = `
    <p>Your Data Provisioning Request for the APMID <strong>${APMID}</strong> has been assigned to a Data Engineer.</p>
    <p>You will be notified once the request is fulfilled.</p>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [CREATED_BY],
    subject: 'Data Provisioning: Assigned to Data Engineer',
    body: emailBody
  });
};

const informUserRequestComplete = async ({ APMID, REQUEST_ID, CREATED_BY }) => {
  const emailBody = `
    <p>Your Data Provisioning Request for the APMID <strong>${APMID}</strong> has been completed!</p>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [CREATED_BY],
    subject: 'Data Provisioning: request complete',
    body: emailBody
  });
};

const informUserRequestCancelledByAdmin = async ({ APMID, REQUEST_ID, CREATED_BY, ADMIN }) => {
  const emailBody = `
    <p>Your Data Provisioning Request for the APMID <strong>${APMID}</strong> has been was cancelled by the framework admin ${ADMIN}.</p>
    <p>You can view the request details here: ${emailUtils.createLink(REQUEST_ID)}.</p>
  `;
  
  return await _sendEmail({
    recipients: [CREATED_BY],
    subject: 'Data Provisioning: request complete',
    body: emailBody
  });
};

const emailService = {
  sendEmail: _sendEmail,
  communicateNewRequestToDataOwner,
  dataOwnerDeclinedRequest,
  dataOwnersApprovedRequest,
  informDPO,
  dpoDeclinedRequest,
  informRequesterDPOApprovedRequest,
  informAdminsOfNewRequest,
  assignDataEngineer,
  informUserRequestWasAssigned,
  informUserRequestComplete,
  informUserRequestCancelledByAdmin
};

export default emailService;