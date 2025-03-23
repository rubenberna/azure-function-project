import { getDpInstance } from '../../../config/server.config.js';
import requestModel from '../../models/request.model.js';
import requestConsts from '../../../consts/request.consts.js';

const createRequest = async (requestDetails) => {
  const dpInstance = await getDpInstance();
  const REQUEST_MODEL = requestModel(dpInstance);
  return REQUEST_MODEL.create(requestDetails);
};

const getUserPendingAdminRequests = async (username) => {
  const dpInstance = await getDpInstance();
  return await dpInstance.query(`
  WITH LOGS_CTE AS (
    SELECT
        REQUEST_ID AS LOG_REQ,
        STATUS_ID AS LOG_STATUS_ID,
        ENUM.NAME AS STATUS_NAME,
        INSERT_TIMESTAMP AS LATEST_LOG,
        ROW_NUMBER() OVER (PARTITION BY REQUEST_ID ORDER BY INSERT_TIMESTAMP DESC) AS RN
    FROM PROVISIONING.STATUS_TRACKER LOGS
    JOIN PROVISIONING.STATUS_ENUM AS ENUM ON ENUM.ID = LOGS.STATUS_ID
),
REQUESTS_WITH_LOGS AS (
    SELECT
        T.REQUEST_ID,
        T.APMID,
        T.TARGET_ENVS,
        T.TARGET_DB_NAMES,
        T.ORIGIN_ENVS,
        T.CREATED_BY,
        T.INSERT_TIMESTAMP,
        T.DPO,
        T.ASSIGNED_DATA_ENGINEER,
        LOGS.LATEST_LOG,
        LOGS.LOG_STATUS_ID,
        LOGS.STATUS_NAME
    FROM [PROVISIONING].[REQUESTS] T
    LEFT JOIN LOGS_CTE LOGS ON T.REQUEST_ID = LOGS.LOG_REQ
    WHERE T.IS_ACTIVE = 1 AND LOGS.RN = 1 -- Only get the latest log
    )
    SELECT
        RWL.REQUEST_ID,
        RWL.APMID,
        RWL.TARGET_ENVS,
        RWL.TARGET_DB_NAMES,
        RWL.ORIGIN_ENVS,
        RWL.CREATED_BY,
        RWL.INSERT_TIMESTAMP,
        RWL.DPO,
        RWL.STATUS_NAME
    FROM REQUESTS_WITH_LOGS RWL
    INNER JOIN (
        SELECT
            APPROVED_BY_DATA_OWNER,
            REQUEST_ID AS LE_REQUEST_ID
        FROM PROVISIONING.LEGAL_ENTITIES
        WHERE DATA_OWNER = :username
    ) LE ON RWL.REQUEST_ID = LE.LE_REQUEST_ID
    WHERE RWL.STATUS_NAME = '${requestConsts.STATUS_ENUM_NAMES.PENDING_DATA_OWNERS}'
       OR (RWL.STATUS_NAME = '${requestConsts.STATUS_ENUM_NAMES.APPROVED_BY_DATA_OWNERS}' AND RWL.DPO = :username)
    GROUP BY
        RWL.REQUEST_ID, RWL.APMID, RWL.TARGET_DB_NAMES, RWL.TARGET_ENVS,
        RWL.ORIGIN_ENVS, RWL.INSERT_TIMESTAMP, RWL.DPO, RWL.STATUS_NAME, RWL.CREATED_BY
    ORDER BY RWL.INSERT_TIMESTAMP DESC;
      `, {
    type: dpInstance.QueryTypes.SELECT,
    replacements: { username }
  });
};

const getRequest = async (params, sequelizeInstance, attributes) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const REQUEST_MODEL = requestModel(dpInstance);
  return await REQUEST_MODEL.findOne({
    where: {
      REQUEST_ID: params.REQUEST_ID
    },
    ...(attributes && { attributes }),
    raw: true
  });
};

const checkIfUserIsDpo = async (username, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const REQUEST_MODEL = requestModel(dpInstance);
  return await REQUEST_MODEL.findOne({
    where: {
      DPO: username
    }
  });
};

const getMyRequests = async ({ username, status }, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  return await dpInstance.query(`
  WITH LOGS_CTE AS (
    SELECT
        REQUEST_ID AS LOG_REQ,
        STATUS_ID AS LOG_STATUS_ID,
        ENUM.NAME AS STATUS_NAME,
        INSERT_TIMESTAMP AS LATEST_LOG,
        ROW_NUMBER() OVER (PARTITION BY REQUEST_ID ORDER BY INSERT_TIMESTAMP DESC) AS RN
    FROM PROVISIONING.STATUS_TRACKER LOGS
    JOIN PROVISIONING.STATUS_ENUM AS ENUM ON ENUM.ID = LOGS.STATUS_ID
),
REQUESTS_WITH_LOGS AS (
    SELECT
        T.REQUEST_ID,
        T.APMID,
        T.TARGET_ENVS,
        T.TARGET_DB_NAMES,
        T.ORIGIN_ENVS,
        T.CREATED_BY,
        T.INSERT_TIMESTAMP,
        T.DPO,
        T.ASSIGNED_DATA_ENGINEER,
        LOGS.LATEST_LOG,
        LOGS.LOG_STATUS_ID,
        LOGS.STATUS_NAME
    FROM [PROVISIONING].[REQUESTS] T
    LEFT JOIN LOGS_CTE LOGS ON T.REQUEST_ID = LOGS.LOG_REQ
    WHERE T.IS_ACTIVE = 1 AND LOGS.RN = 1 -- Only get the latest log
    )
    SELECT
        RWL.REQUEST_ID,
        RWL.APMID,
        RWL.TARGET_ENVS,
        RWL.TARGET_DB_NAMES,
        RWL.ORIGIN_ENVS,
        RWL.CREATED_BY,
        RWL.INSERT_TIMESTAMP,
        RWL.DPO,
        RWL.STATUS_NAME
    FROM REQUESTS_WITH_LOGS RWL
    INNER JOIN (
        SELECT
            APPROVED_BY_DATA_OWNER,
            REQUEST_ID AS LE_REQUEST_ID
        FROM PROVISIONING.LEGAL_ENTITIES
    ) LE ON RWL.REQUEST_ID = LE.LE_REQUEST_ID
    WHERE RWL.CREATED_BY = :username
            ${!!status ? `AND RWL.STATUS_NAME = :status` : ''}
    GROUP BY
        RWL.REQUEST_ID, RWL.APMID, RWL.TARGET_DB_NAMES, RWL.TARGET_ENVS,
        RWL.ORIGIN_ENVS, RWL.INSERT_TIMESTAMP, RWL.DPO, RWL.STATUS_NAME, RWL.CREATED_BY
    ORDER BY RWL.INSERT_TIMESTAMP DESC;
      `, {
    type: dpInstance.QueryTypes.SELECT,
    replacements: { username, status }
  });
};

const getDERequests = async ({ engineerId, status }, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  return await dpInstance.query(`
  WITH LOGS_CTE AS (
    SELECT
        REQUEST_ID AS LOG_REQ,
        STATUS_ID AS LOG_STATUS_ID,
        ENUM.NAME AS STATUS_NAME,
        INSERT_TIMESTAMP AS LATEST_LOG,
        ROW_NUMBER() OVER (PARTITION BY REQUEST_ID ORDER BY INSERT_TIMESTAMP DESC) AS RN
    FROM PROVISIONING.STATUS_TRACKER LOGS
    JOIN PROVISIONING.STATUS_ENUM AS ENUM ON ENUM.ID = LOGS.STATUS_ID
),
REQUESTS_WITH_LOGS AS (
    SELECT
        T.REQUEST_ID,
        T.APMID,
        T.TARGET_ENVS,
        T.TARGET_DB_NAMES,
        T.ORIGIN_ENVS,
        T.CREATED_BY,
        T.INSERT_TIMESTAMP,
        T.DPO,
        T.ASSIGNED_DATA_ENGINEER,
        LOGS.LATEST_LOG,
        LOGS.LOG_STATUS_ID,
        LOGS.STATUS_NAME
    FROM [PROVISIONING].[REQUESTS] T
    LEFT JOIN LOGS_CTE LOGS ON T.REQUEST_ID = LOGS.LOG_REQ
    WHERE T.IS_ACTIVE = 1 AND LOGS.RN = 1 -- Only get the latest log
    )
    SELECT
        RWL.REQUEST_ID,
        RWL.APMID,
        RWL.TARGET_ENVS,
        RWL.TARGET_DB_NAMES,
        RWL.ORIGIN_ENVS,
        RWL.CREATED_BY,
        RWL.INSERT_TIMESTAMP,
        RWL.DPO,
        RWL.STATUS_NAME
    FROM REQUESTS_WITH_LOGS RWL
    INNER JOIN (
        SELECT
            APPROVED_BY_DATA_OWNER,
            REQUEST_ID AS LE_REQUEST_ID
        FROM PROVISIONING.LEGAL_ENTITIES
    ) LE ON RWL.REQUEST_ID = LE.LE_REQUEST_ID
    WHERE RWL.ASSIGNED_DATA_ENGINEER = :engineerId AND RWL.STATUS_NAME = '${requestConsts.STATUS_ENUM_NAMES.ASSIGNED_DATA_ENGINEER}'
    GROUP BY
        RWL.REQUEST_ID, RWL.APMID, RWL.TARGET_DB_NAMES, RWL.TARGET_ENVS,
        RWL.ORIGIN_ENVS, RWL.INSERT_TIMESTAMP, RWL.DPO, RWL.STATUS_NAME, RWL.CREATED_BY
    ORDER BY RWL.INSERT_TIMESTAMP DESC;
      `, {
    type: dpInstance.QueryTypes.SELECT,
    replacements: { engineerId, status }
  });
};

const assignDataEngineer = async ({ REQUEST_ID, ASSIGNED_DATA_ENGINEER, UPDATED_BY }, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const REQUEST_MODEL = requestModel(dpInstance);
  return await REQUEST_MODEL.update({
    ASSIGNED_DATA_ENGINEER,
    UPDATED_BY,
    MODIFIED_DATE: dpInstance.literal('CURRENT_TIMESTAMP')
  }, {
    where: {
      REQUEST_ID
    }
  });
};

const getAdminRequests = async ({ status }, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  return await dpInstance.query(`
  WITH LOGS_CTE AS (
    SELECT
        REQUEST_ID AS LOG_REQ,
        STATUS_ID AS LOG_STATUS_ID,
        ENUM.NAME AS STATUS_NAME,
        INSERT_TIMESTAMP AS LATEST_LOG,
        ROW_NUMBER() OVER (PARTITION BY REQUEST_ID ORDER BY INSERT_TIMESTAMP DESC) AS RN
    FROM PROVISIONING.STATUS_TRACKER LOGS
    JOIN PROVISIONING.STATUS_ENUM AS ENUM ON ENUM.ID = LOGS.STATUS_ID
),
REQUESTS_WITH_LOGS AS (
    SELECT
        T.REQUEST_ID,
        T.APMID,
        T.TARGET_ENVS,
        T.TARGET_DB_NAMES,
        T.ORIGIN_ENVS,
        T.CREATED_BY,
        T.INSERT_TIMESTAMP,
        T.DPO,
        T.ASSIGNED_DATA_ENGINEER,
        LOGS.LATEST_LOG,
        LOGS.LOG_STATUS_ID,
        LOGS.STATUS_NAME
    FROM [PROVISIONING].[REQUESTS] T
    LEFT JOIN LOGS_CTE LOGS ON T.REQUEST_ID = LOGS.LOG_REQ
    WHERE T.IS_ACTIVE = 1 AND LOGS.RN = 1 -- Only get the latest log
    )
    SELECT
        RWL.REQUEST_ID,
        RWL.APMID,
        RWL.TARGET_ENVS,
        RWL.TARGET_DB_NAMES,
        RWL.ORIGIN_ENVS,
        RWL.CREATED_BY,
        RWL.INSERT_TIMESTAMP,
        RWL.DPO,
        RWL.STATUS_NAME
    FROM REQUESTS_WITH_LOGS RWL
    INNER JOIN (
        SELECT
            APPROVED_BY_DATA_OWNER,
            REQUEST_ID AS LE_REQUEST_ID
        FROM PROVISIONING.LEGAL_ENTITIES
    ) LE ON RWL.REQUEST_ID = LE.LE_REQUEST_ID
    ${!!status ? `WHERE RWL.STATUS_NAME = :status` : ''}
    GROUP BY
        RWL.REQUEST_ID, RWL.APMID, RWL.TARGET_DB_NAMES, RWL.TARGET_ENVS,
        RWL.ORIGIN_ENVS, RWL.INSERT_TIMESTAMP, RWL.DPO, RWL.STATUS_NAME, RWL.CREATED_BY
    ORDER BY RWL.INSERT_TIMESTAMP DESC;
      `, {
    type: dpInstance.QueryTypes.SELECT,
    replacements: { status }
  });
};

const getApprovalRequestsForUser = async (username) => {
  const dpInstance = await getDpInstance();
  return await dpInstance.query(`
  WITH LOGS_CTE AS (
    SELECT
        REQUEST_ID AS LOG_REQ,
        STATUS_ID AS LOG_STATUS_ID,
        ENUM.NAME AS STATUS_NAME,
        INSERT_TIMESTAMP AS LATEST_LOG,
        ROW_NUMBER() OVER (PARTITION BY REQUEST_ID ORDER BY INSERT_TIMESTAMP DESC) AS RN
    FROM PROVISIONING.STATUS_TRACKER LOGS
    JOIN PROVISIONING.STATUS_ENUM AS ENUM ON ENUM.ID = LOGS.STATUS_ID
),
REQUESTS_WITH_LOGS AS (
    SELECT
        T.REQUEST_ID,
        T.APMID,
        T.TARGET_ENVS,
        T.TARGET_DB_NAMES,
        T.ORIGIN_ENVS,
        T.CREATED_BY,
        T.INSERT_TIMESTAMP,
        T.DPO,
        T.ASSIGNED_DATA_ENGINEER,
        LOGS.LATEST_LOG,
        LOGS.LOG_STATUS_ID,
        LOGS.STATUS_NAME
    FROM [PROVISIONING].[REQUESTS] T
    LEFT JOIN LOGS_CTE LOGS ON T.REQUEST_ID = LOGS.LOG_REQ AND LOGS.RN = 1 -- Keep null values
    WHERE T.IS_ACTIVE = 1
)
SELECT DISTINCT  -- Avoid unnecessary GROUP BY
    RWL.REQUEST_ID,
    RWL.APMID,
    RWL.TARGET_ENVS,
    RWL.TARGET_DB_NAMES,
    RWL.ORIGIN_ENVS,
    RWL.CREATED_BY,
    RWL.INSERT_TIMESTAMP,
    RWL.DPO,
    RWL.STATUS_NAME
FROM REQUESTS_WITH_LOGS RWL
LEFT JOIN (
    SELECT
        REQUEST_ID AS LE_REQUEST_ID,
        DATA_OWNER
    FROM PROVISIONING.LEGAL_ENTITIES
) LE ON RWL.REQUEST_ID = LE.LE_REQUEST_ID
WHERE RWL.DPO = :username OR LE.DATA_OWNER = :username -- Include both conditions
ORDER BY RWL.INSERT_TIMESTAMP DESC;

      `, {
    type: dpInstance.QueryTypes.SELECT,
    replacements: { username }
  });
};

const queries = {
  createRequest,
  getUserPendingAdminRequests,
  getRequest,
  checkIfUserIsDpo,
  getMyRequests,
  assignDataEngineer,
  getDERequests,
  getAdminRequests,
  getApprovalRequestsForUser
};

export default queries;