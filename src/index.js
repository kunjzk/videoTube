import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

// Try without explicit path
dotenv.config();

const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    console.log("Connected successfuly to MongoDB");
    console.log("Selected PORT:", PORT);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo connection error", err);
  });
