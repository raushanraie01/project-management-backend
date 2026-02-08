import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 3001;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is runnng at Port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Connection error");
    process.exit(1);
  });
