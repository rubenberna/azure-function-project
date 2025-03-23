import { DataTypes } from 'sequelize';
import { DOMAIN_TYPE } from '../../types/domain.type.js';

const {
  Domain_ID,
  Domain_Delta,
  Domain_Target
} = DOMAIN_TYPE;

export default (sequelize) => {
  return sequelize.define('DOMAIN', {
    [Domain_ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    [Domain_Delta]: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    [Domain_Target]: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'DBB_DOMAINS',
    timestamps: false,
  });
}



