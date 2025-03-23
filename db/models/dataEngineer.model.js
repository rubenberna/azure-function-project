import { DataTypes } from 'sequelize';
import { DATA_ENGINEER_TYPE } from '../../types/dataEngineer.type.js';

const {
  ID,
  DATA_ENGINEER
} = DATA_ENGINEER_TYPE;

export default (sequelize) => {
  return sequelize.define('DATA_ENGINEER', {
    [ID]: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    [DATA_ENGINEER]: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'DATA_ENGINEERS',
    timestamps: false,
  });
}



