import { DataTypes } from 'sequelize';
import { STATUS_TRACKER_TYPE } from '../../types/statusTracker.type.js';

const {
  ID,
  REQUEST_ID,
  STATUS_ID,
  INSERT_TIMESTAMP,
  CREATED_BY,
} = STATUS_TRACKER_TYPE;

export default (sequelize) => {
  return sequelize.define('STATUS_TRACKER', {
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
    [STATUS_ID]: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    [INSERT_TIMESTAMP]: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    [CREATED_BY]: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    freezeTableName: true,
    schema: 'PROVISIONING',
    tableName: 'STATUS_TRACKER',
    timestamps: false,
  });
}



