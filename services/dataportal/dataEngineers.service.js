import dataEngineerQueries from '../../db/queries/dataPortal/dataEngineer.queries.js';

const getAllDataEngineers = async () => {
  return await dataEngineerQueries.getAllDataEngineers();
};

const service = {
  getAllDataEngineers
};

export default service;