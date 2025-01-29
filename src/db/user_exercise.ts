/* eslint import/no-cycle: 0 */

import { Sequelize, DataTypes } from 'sequelize';
import { DatabaseModel } from '../types/db';
import { UserModel } from './user';
import { ExerciseModel } from './exercise';

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
      },
      exerciseId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'exercise',
          key: 'id',
        },
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
      paranoid: true,
      timestamps: true,
      sequelize,
      modelName: 'user_exercise',
    },
  );
  //   UserExerciseModel.associate = (models: any) => {
  //     ExerciseModel.belongsToMany(models.User, {
  //       through: models.UserExercise,
  //     });
  //     UserModel.belongsToMany(models.Exercise, {
  //       through: models.UserExercise,
  //     });
  //   };

  return UserExerciseModel;
};
