import axios from 'axios';
import { ClientSecretCredential } from '@azure/identity';

const client = axios.create({
  baseURL: 'https://gttpv-prod-euw-apim.azure-api.net/api/',
  headers: {
    'Ocp-Apim-Subscription-Key': process.env.PLANVIEW_SUBSCRIPTION_KEY
  }
});

const getToken = async () => {
  const clientId = process.env.AZURE_AD_CLIENT_ID;       // App Registration Client ID
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET; // App Registration Client Secret
  const tenantId = process.env.AZURE_AD_TENANT_ID;       // Tenant ID
  const scope = process.env.PLANVIEW_SCOPE;
  
  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
  return await credential.getToken(scope);
};

const searchProjects = async (searchTerm) => {
  const accessToken = (await getToken())?.token;
  const filterQuery = encodeURIComponent(`product_code eq '${searchTerm}' or apm_short_name eq '${searchTerm}'`);
  const url = `OutcomeBasicInfo/GetData?filter=${filterQuery}`;
  const res = await client.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res?.data;
};

const getDPO = async (apmId) => {
  if (!apmId) {
    return null;
  }
  const accessToken = (await getToken())?.token;
  const filterQuery = encodeURIComponent(`product_code eq '${apmId}'`);
  const url = `OutcomeDeliveryInfo/GetData?filter=${filterQuery}`;
  const res = await client.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res?.data;
};

const service = {
  getToken,
  searchProjects,
  getDPO
};

export default service;