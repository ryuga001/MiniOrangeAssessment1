import express from "express"
import cors from "cors"
import dotenv  from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/user.js"
import cookieParser from "cookie-parser";

dotenv.config();


const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5001"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(cookieParser())
app.use(express.json());
app.use("/api/v1",userRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
