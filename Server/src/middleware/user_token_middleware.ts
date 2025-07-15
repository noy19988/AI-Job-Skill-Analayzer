import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface Payload {
  _id: string;
}

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server error: ACCESS_TOKEN_SECRET missing" });
  }

  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.params.userId = (payload as Payload)._id;
    next();
  });
};


export default verifyAccessToken;
