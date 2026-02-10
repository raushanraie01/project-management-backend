import "./config.js"; //importing dot env data
import app from "./app.js";
import connectDB from "./db/index.js";

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
