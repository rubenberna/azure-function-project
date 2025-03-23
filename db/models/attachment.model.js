import { DataTypes } from 'sequelize';
import { ATTACHMENT_TYPE } from '../../types/attachment.type.js';

const {
  ID,
  REQUEST_ID,
  FILE_NAME,
  FILE_LOCATION
} = ATTACHMENT_TYPE;

export default (sequelize) => {
  return sequelize.define('ATTACHMENT', {
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
    [FILE_NAME]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    [FILE_LOCATION]: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'ATTACHMENTS',
    timestamps: false,
  });
}


