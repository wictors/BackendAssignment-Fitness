/* eslint import/no-cycle: 0 */

import {
    Sequelize,
    DataTypes,
} from 'sequelize'
import { DatabaseModel } from '../types/db'

export class UserExerciseModel extends DatabaseModel {
    id: number
    userId: number
    exerciseId: number
    completedAt: Date
    duration: number
}

export default (sequelize: Sequelize) => {
    UserExerciseModel.init({
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
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
        }
    }, {
        paranoid: true,
        timestamps: true,
        sequelize,
        modelName: 'user_exercise'
    })

    return UserExerciseModel
}
