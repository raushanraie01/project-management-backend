import app from "./app.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
   console.log(`Server is runnng at Port: ${process.env.PORT}`);
});
