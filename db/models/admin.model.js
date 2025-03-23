import { DataTypes } from 'sequelize';
import { ADMIN_TYPE } from '../../types/admin.type.js';

const {
  ID,
  USERNAME,
} = ADMIN_TYPE;

export default (sequelize) => {
  return sequelize.define('ADMIN', {
    [ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    [USERNAME]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'ADMINS',
    timestamps: false,
  });
}



