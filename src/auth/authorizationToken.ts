import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try{
        const token = req.headers['authorization'];
      
        if (!token) {
            return res.status(401).json({ message: 'Access Denied' });
        }
      
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (verified) {
            return res.send("Successfully Verified");
        } else {
            return res.status(401).send('Access Denied');
        }
    } catch(err){
        return res.status(401).send('Access Denied');
    }   
};

export const generateAccessToken = (): string => {
    return jwt.sign({email:'mail'}, process.env.JWT_SECRET_KEY, { expiresIn: '5m' }); 
};