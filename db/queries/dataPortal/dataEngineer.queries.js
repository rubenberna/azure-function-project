import { getDpInstance } from '../../../config/server.config.js';
import dataEngineerModel from '../../models/dataEngineer.model.js';
import { DATA_ENGINEER_TYPE } from '../../../types/dataEngineer.type.js';

const getDataEngineer = async (username, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const DATA_ENGINEER = dataEngineerModel(dpInstance);
  return await DATA_ENGINEER.findOne({
    where: {
      [DATA_ENGINEER_TYPE.DATA_ENGINEER]: username
    }
  });
};

const getDataEngineerById = async (id, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const DATA_ENGINEER = dataEngineerModel(dpInstance);
  return await DATA_ENGINEER.findOne({
    where: {
      [DATA_ENGINEER_TYPE.ID]: id
    }
  });
};

export const findOrCreateDataEngineer = async (dataEngineer, sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const DATA_ENGINEER = dataEngineerModel(dpInstance);
  return await DATA_ENGINEER.findOrCreate({
    where: {
      [DATA_ENGINEER_TYPE.DATA_ENGINEER]: dataEngineer
    },
    defaults: dataEngineer
  });
};

const getAllDataEngineers = async (sequelizeInstance) => {
  const dpInstance = sequelizeInstance ?? await getDpInstance();
  const DATA_ENGINEER = dataEngineerModel(dpInstance);
  return await DATA_ENGINEER.findAll();
};

const queries = {
  getDataEngineer,
  findOrCreateDataEngineer,
  getDataEngineerById,
  getAllDataEngineers
};

export default queries;