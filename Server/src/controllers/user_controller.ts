import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';

const register = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            email: req.body.email,
            password: hashedPassword
        });
        res.status(200).send(user);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).send("wrong email or password");
    }
};

const generateTokens = (user: IUser): { accessToken: string, refreshToken: string } | null => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    return null;
  }

  const secret = process.env.ACCESS_TOKEN_SECRET as string;
  const random = Math.random().toString();

  const accessToken = jwt.sign(
    { _id: user._id, random },
    secret,
    { expiresIn: process.env.TOKEN_EXPIRE ? parseInt(process.env.TOKEN_EXPIRE, 10) : '1h' }
  );

  const refreshToken = jwt.sign(
    { _id: user._id, random },
    secret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE ? parseInt(process.env.REFRESH_TOKEN_EXPIRE, 10) : '7d' }
  );

  if (!user.refreshToken) {
    user.refreshToken = [];
  }
  user.refreshToken.push(refreshToken);

  return { accessToken, refreshToken };
};


const login = async (req: Request, res: Response) => {
    try {
      console.log("Login request:", req.body); 
  
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) {
        res.status(400).send("wrong email or password");
        return;
      }
  
      const valid = await bcrypt.compare(req.body.password, user.password);
      if (!valid) {
        res.status(400).send("wrong email or password");
        return;
      }
  
      const tokens = generateTokens(user);
      if (!tokens) {
        res.status(400).send("Access Denied");
        return;
      }
  
      await user.save();
      console.log("Login success");
      res.status(200).send({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        _id: user._id
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).send("wrong email or password");
    }
  };
  

type UserDocument = Document<unknown, object, IUser> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}

interface JwtPayload {
    _id: string;
    random: string;
}

const verifyAccessToken = (refreshToken: string | undefined) => {
    return new Promise<UserDocument>((resolve, reject) => {
        if (!refreshToken) {
            reject("Access Denied");
            return;
        }
        if (!process.env.ACCESS_TOKEN_SECRET) {
            reject("Server Error");
            return;
        }
        jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, async (error: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (error) {
                reject("Access Denied");
                return;
            }
            const userId = (payload as JwtPayload)._id;
            try {
                const user = await userModel.findById(userId);
                if (!user) {
                    reject("Access Denied");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    reject("Access Denied");
                    return;
                }
                user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
                resolve(user);
            } catch (dbError) {
                console.error('Database error in verifyAccessToken:', dbError);
                reject("Access Denied");
                return;
            }
        });
    });
};

const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyAccessToken(req.body.refreshToken);
        await user.save();
        res.status(200).send("Logged out");
    } catch (error) {
        console.error('Logout error:', error);
        res.status(400).send("Access Denied");
        return;
    }
};

const refresh = async (req: Request, res: Response) => {
    try {
        const user = await verifyAccessToken(req.body.refreshToken);

        const tokens = generateTokens(user);
        await user.save();

        if (!tokens) {
            res.status(400).send("Access Denied");
            return;
        }
        res.status(200).send({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(400).send("Access Denied");
        return;
    }
};

interface AuthPayload {
    _id: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    const token = authorization && authorization.split(" ")[1];
    if (!token) {
        res.status(401).send("Access Denied");
        return;
    }
    if (!process.env.ACCESS_TOKEN_SECRET) {
        res.status(400).send("Server Error");
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
        if (error) {
            res.status(401).send("Access Denied");
            return;
        }
        const userId = (payload as AuthPayload)._id;
        req.params.userId = userId;
        next();
    });
};

export default {
    register,
    login,
    logout,
    refresh
};