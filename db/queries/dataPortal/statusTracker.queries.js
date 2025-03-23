import { getDpInstance } from '../../../config/server.config.js';
import statusLogModel from '../../models/statusTracker.model.js';

const createStatusLog = async (newLog) => {
  const dpInstance = await getDpInstance();
  const STATUS_TRACKER = statusLogModel(dpInstance);
  return STATUS_TRACKER.create(newLog);
};

const getLatestStatusFromRequest = async (params, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  return await dpInstance.query(`
    SELECT TOP(1)
    S.NAME,
    S.[DESCRIPTION],
    T.CREATED_BY,
    T.INSERT_TIMESTAMP
    FROM [PROVISIONING].[STATUS_TRACKER] T
    JOIN [PROVISIONING].[STATUS_ENUM] S ON T.STATUS_ID = S.ID
    WHERE REQUEST_ID = :REQUEST_ID
    ORDER BY T.INSERT_TIMESTAMP DESC
  `, {
    replacements: { REQUEST_ID: params.REQUEST_ID },
    type: dpInstance.QueryTypes.SELECT
  });
};

const queries = {
  createStatusLog,
  getLatestStatusFromRequest
};

export default queries;