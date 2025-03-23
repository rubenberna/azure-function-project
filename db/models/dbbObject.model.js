import { DataTypes } from 'sequelize';
import { DBB_OBJECT_TYPE } from '../../types/dbbObject.type.js';

const {
  Domain_ID,
  Object_Name,
} = DBB_OBJECT_TYPE;

export default (sequelize) => {
  return sequelize.define('DBB_OBJECT', {
    [Domain_ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    [Object_Name]: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'DBB_OBJECTS',
    timestamps: false,
  });
}



