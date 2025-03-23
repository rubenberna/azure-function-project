import { DataTypes } from 'sequelize';
import { CONNECTION_TYPE } from '../../types/connection.type.js';

const {
  ID,
  REQUEST_ID,
  DOMAIN_NAME,
  ENTITY_NAME,
  INSERT_TIMESTAMP,
  MODIFIED_DATE,
  IS_ACTIVE,
  APPROVED_BY_DPO,
  UPDATED_BY,
} = CONNECTION_TYPE;

export default (sequelize) => {
  return sequelize.define('CONNECTION', {
    [ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    [REQUEST_ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    [DOMAIN_NAME]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [ENTITY_NAME]: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    [IS_ACTIVE]: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    [APPROVED_BY_DPO]: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    [UPDATED_BY]: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'CONNECTIONS',
    timestamps: false,
  });
}


