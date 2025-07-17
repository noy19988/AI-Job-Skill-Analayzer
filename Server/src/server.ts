import express, { Express } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bodyParser from "body-parser";
import userRoutes from "./routes/user_routes"; 
import aiRoutes from "./routes/ai_routes"; 
import indexLogsRoutes from "./routes/indexlogs_routes";


import cors from 'cors';

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
  }));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/indexlogs", indexLogsRoutes);



app.get("/about", (req, res) => {
  res.send("Hello World!");
});

const initApp = (): Promise<Express> => {
    return new Promise<Express>((resolve, reject) => {
      const connectToDatabase = async () => {
        try {
          if (!process.env.DB_CONNECTION) {
            throw new Error("DB_CONNECTION is not defined");
          }
  
          await mongoose.connect(process.env.DB_CONNECTION);
          console.log("Connected to MongoDB!");
          resolve(app);
        } catch (err) {
          console.error("Error connecting to MongoDB:", err);
          reject(err);
        }
      };
  
      connectToDatabase().catch((err: unknown) => {
        console.error("connection error:", err);
        reject(err);
      });
    });
  };
  

export default initApp;