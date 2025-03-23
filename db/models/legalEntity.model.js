import { DataTypes } from 'sequelize';
import { LEGAL_ENTITY_TYPE } from '../../types/legalEntity.type.js';

const {
  ID,
  REQUEST_ID,
  LEGAL_ENTITY_CODE,
  INSERT_TIMESTAMP,
  MODIFIED_DATE,
  IS_ACTIVE,
  APPROVED_BY_DATA_OWNER,
  DATA_OWNER,
  LEGAL_ENTITY_NAME
} = LEGAL_ENTITY_TYPE;

export default (sequelize) => {
  return sequelize.define('LEGAL_ENTITY', {
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
    [LEGAL_ENTITY_CODE]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [LEGAL_ENTITY_NAME]: {
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
    [APPROVED_BY_DATA_OWNER]: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0
    },
    [DATA_OWNER]: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'LEGAL_ENTITIES',
    timestamps: false,
  });
}



