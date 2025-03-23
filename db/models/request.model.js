import { DataTypes } from 'sequelize';
import { REQUEST_TYPE } from '../../types/request.type.js';

const {
  REQUEST_ID,
  APMID,
  APM_SHORT_NAME,
  TARGET_ENVS,
  TARGET_DB_NAMES,
  EXPLORATION_PURPOSE,
  ORIGIN_ENVS,
  LEGAL_APPROVAL_TYPE,
  LEGAL_APPROVER,
  FILTERS,
  CREATED_BY,
  DPO,
  ASSIGNED_DATA_ENGINEER,
  IS_ACTIVE,
  INSERT_TIMESTAMP,
  MODIFIED_DATE
} = REQUEST_TYPE;

export default (sequelize) => {
  return sequelize.define('REQUEST', {
    [REQUEST_ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    [APMID]: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    [APM_SHORT_NAME]: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    [TARGET_ENVS]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [TARGET_DB_NAMES]: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    [EXPLORATION_PURPOSE]: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    [ORIGIN_ENVS]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [LEGAL_APPROVAL_TYPE]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [LEGAL_APPROVER]: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    [FILTERS]: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    [CREATED_BY]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [DPO]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [ASSIGNED_DATA_ENGINEER]: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    [IS_ACTIVE]: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    [INSERT_TIMESTAMP]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    [MODIFIED_DATE]: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'REQUESTS',
    timestamps: false,
  });
}


