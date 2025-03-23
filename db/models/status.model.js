import { DataTypes } from 'sequelize';
import { STATUS_ENUM_TYPE } from '../../types/status.type.js';

const {
  ID,
  NAME,
  DESCRIPTION
} = STATUS_ENUM_TYPE;

export default (sequelize) => {
  return sequelize.define('STATUS_ENUM', {
    [ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    [NAME]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [DESCRIPTION]: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'STATUS_ENUM',
    timestamps: false,
  });
}



