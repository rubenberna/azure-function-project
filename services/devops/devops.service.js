import { DefaultAzureCredential } from '@azure/identity';
import axios from 'axios';
import { DEVOPS_USER_STORY_TYPE } from '../../types/devops.type.js';
import emailUtils from '../../utils/email.utils.js';

const {
  UAMI_DEVOPS: userAssignedManagedIdentity,
  DEVOPS_ORGANISATION: organization,
  DEVOPS_PROJECT: project,
  DEVOPS_WORK_ITEM_TYPE,
  DEVOPS_PARENT_FEATURE_ID: parentFeatureId
} = process.env;

const generateToken = async () => {
  const credential = new DefaultAzureCredential({
    managedIdentityClientId: userAssignedManagedIdentity,
  });
  return (await credential.getToken('499b84ac-1321-427f-aa17-267ca6975798/.default'))?.token;
};

const generateUserStoryData = (requestDetails) => {
  const requestId = requestDetails[DEVOPS_USER_STORY_TYPE.REQUEST_ID];
  return [
    {
      op: 'add',
      path: '/fields/System.Title',
      value: `New Provisioning Request: #${requestId}`,
    },
    {
      op: 'add',
      path: '/fields/System.Description',
      value: `
        <div>
        <p>There's a new Provisioning Request created in the Data Portal.</p>
        <p><strong>Request Id: </strong>${requestId}</p>
        <p><strong>Created by: </strong>${requestDetails[DEVOPS_USER_STORY_TYPE.CREATED_BY]}</p>
        <p><strong>APMID: </strong>${requestDetails[DEVOPS_USER_STORY_TYPE.APMID]}</p>
        <p><strong>More details: </strong>${emailUtils.createLink(requestId)}</p>
        <p><strong>Once complete, please click on the here: ${emailUtils.createLink(requestId, true)}</strong></p>
        </div>
      `,
    },
    {
      op: 'add',
      path: '/fields/Microsoft.VSTS.Common.Priority',
      value: 1,
    },
    {
      op: 'add',
      path: '/relations/-',
      value: {
        rel: 'System.LinkTypes.Hierarchy-Reverse',
        url: `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/${parentFeatureId}`,
        attributes: {
          comment: 'Linking this User Story to the parent Feature.'
        }
      }
    },
    {
      op: 'add',
      path: '/fields/System.AssignedTo',
      value: requestDetails[DEVOPS_USER_STORY_TYPE.ASSIGNED_DATA_ENGINEER] // Assign using the user's email
    }
  ];
};
const createTicket = async (requestDetails) => {
  const token = await generateToken();
  const workItemType = DEVOPS_WORK_ITEM_TYPE?.replace('_', ' ');
  
  const url = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$${workItemType}?api-version=7.1-preview.3`;
  const data = generateUserStoryData(requestDetails);
  
  const config = {
    headers: {
      'Content-Type': 'application/json-patch+json',
      Authorization: `Basic ${Buffer.from(`:${token}`).toString('base64')}`,
    },
  };
  const response = await axios.post(url, data, config);
  return response.data;
};

const service = {
  createTicket
};

export default service;