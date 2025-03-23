import { LEGAL_ENTITY_TYPE } from '../types/legalEntity.type.js';
import emailConsts from '../consts/email.consts.js';

const env = process.env.ENVIRONMENT;

function generateList(legalEntities) {
  let html = ``;
  html += '<ul>';
  for (const le of legalEntities) {
    html += `<li><strong>${le[LEGAL_ENTITY_TYPE.LEGAL_ENTITY_CODE]}</strong>: ${le[LEGAL_ENTITY_TYPE.LEGAL_ENTITY_NAME]}</li>`;
  }
  html += '</ul>';
  return html;
}

const createLink = (requestId, withCompleteWebhook) => {
  const link = `${emailConsts.DATA_PORTAL_URL[env]}/provisioning-request?request-id=${requestId}${withCompleteWebhook ? '&completed=true' : ''}`;
  return `<a style="color: #0072E4;font-weight: bold" href="${link}">link</a>`;
};

const emailUtils = {
  generateList,
  createLink
};

export default emailUtils;