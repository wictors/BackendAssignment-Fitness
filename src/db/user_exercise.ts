/* eslint import/no-cycle: 0 */

import { Sequelize, DataTypes } from 'sequelize';
import { DatabaseModel } from '../types/db';

export class UserExerciseModel extends DatabaseModel {
  id: number;
  userId: number;
  exerciseId: number;
  completedAt: Date;
  duration: number;
}

export default (sequelize: Sequelize) => {
  UserExerciseModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        unique: false,
      },
      exerciseId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'exercise',
          key: 'id',
        },
        unique: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      paranoid: false, // Test hard delete
      timestamps: true,
      sequelize,
      modelName: 'user_exercise',
      indexes: [
        {
          fields: ['userId', 'exerciseId'],
          unique: false,
        },
      ],
    },
  );

  UserExerciseModel.associate = (models) => {
    (UserExerciseModel as any).belongsTo(models.Exercise, {
      foreignKey: 'exerciseId',
    });
  };

  return UserExerciseModel;
};
