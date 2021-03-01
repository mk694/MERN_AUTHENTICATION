import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import UserRouter from "./routes/userRouter.js";
import UploadRouter from "./routes/uploadRouter.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) throw err;
    console.log("mongodb is connected");
  }
);



app.use("/user", UserRouter);
app.use("/api", UploadRouter);

app.use("/", (req, res, next) => {
  res.json({ msg: "Hello World" });
  next();
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`app is running on port:http://localhost:${port}`);
});
