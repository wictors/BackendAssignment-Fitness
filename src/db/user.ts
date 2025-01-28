/* eslint import/no-cycle: 0 */

import {
    Sequelize,
    DataTypes,
} from 'sequelize'
import { DatabaseModel } from '../types/db'
import { USER_ROLE } from '../utils/enums'

export class UserModel extends DatabaseModel {
    id: number
    name: string
    surname: string
    nickName: string
    email: string
    age: number
    role: USER_ROLE
    password: string
}

export default (sequelize: Sequelize) => {
    UserModel.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
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
        },
        age: {
            type: DataTypes.INTEGER,
        },
        role: {
            type: DataTypes.ENUM(...Object.values(USER_ROLE))
        },
        password: {
            type: DataTypes.STRING(200),
        }
    }, {
        paranoid: true,
        timestamps: true,
        sequelize,
        modelName: 'user'
    })

    UserModel.associate = (models) => {
        (UserModel as any).belongsToMany(models.Exercise, {
            through: models.UserExercise,
            as: 'exerciseDetail',
        })
    }

    return UserModel
}
