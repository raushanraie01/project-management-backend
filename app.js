import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();

app.get("/", (req, res) => {
   res.send("Hello World");
});

const PORT = process.env.PORT || 3001;
app.listen(() => {
   console.log(`Server is runnng at Port: ${process.env.PORT}`);
});
