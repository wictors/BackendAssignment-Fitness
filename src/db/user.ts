/* eslint import/no-cycle: 0 */

import {
  Sequelize,
  DataTypes,
  BelongsToManyAddAssociationMixin,
} from 'sequelize';
import bcrypt from 'bcrypt';
import { DatabaseModel } from '../types/db';
import { USER_ROLE } from '../utils/enums';
import { ExerciseModel } from './exercise';

export class UserModel extends DatabaseModel {
  id: number;
  name: string;
  surname: string;
  nickName: string;
  email: string;
  age: number;
  role: USER_ROLE;
  password: string;

  public addExercise!: BelongsToManyAddAssociationMixin<ExerciseModel, number>;
}

export default (sequelize: Sequelize) => {
  UserModel.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(200),
      },
      surname: {
        type: DataTypes.STRING(200),
      },
      nickName: {
        type: DataTypes.STRING(200),
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      age: {
        type: DataTypes.INTEGER,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(USER_ROLE)),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
      sequelize,
      modelName: 'user',
      hooks: {
        beforeCreate: (user: UserModel) => {
          const salt = bcrypt.genSaltSync();
          user.password = bcrypt.hashSync(user.password, salt);
        },
      },
    },
  );

  UserModel.associate = (models) => {
    (UserModel as any).belongsToMany(models.Exercise, {
      through: { model: models.UserExercise, unique: false },
    });
  };

  return UserModel;
};
