import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { DefaultAzureCredential } from '@azure/identity';

const configDetails = {
  dataPortal: {
    database: process.env.DATA_PORTAL_DB,
    server: process.env.DATA_PORTAL_SERVER
  }
};

const getAccessToken = async () => {
  const credential = new DefaultAzureCredential({
    managedIdentityClientId: process.env.UAMI
  });
  
  const tokenResponse = await credential.getToken('https://database.windows.net/.default');
  return tokenResponse.token;
};

const initializeSequelize = async (database, server) => {
  
  const sequelize = new Sequelize({
    dialect: 'mssql',
    database: database,
    host: server,
    dialectOptions: {
      authentication: {
        type: 'azure-active-directory-access-token',
        options: {
          token: null
        }
      },
    }
  });
  
  sequelize.beforeConnect(async (config) => {
    config.dialectOptions.authentication.options.token = await getAccessToken();
  });
  
  try {
    await sequelize.authenticate();
    console.log(`Connection to ${database} has been established successfully.`);
  } catch (error) {
    console.error(`Unable to connect to the database ${database}:`, error);
  }
  
  return sequelize;
};

export let dataPortalInstance;

export const getDpInstance = async () => {
  if (!dataPortalInstance) {
    dataPortalInstance = await initializeSequelize(configDetails.dataPortal.database, configDetails.dataPortal.server);
  }
  return dataPortalInstance;
};
