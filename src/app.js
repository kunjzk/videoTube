import express from "express";
import cors from "cors";

const app = express();

// control access to the database
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// common middleware
// maximum request data is 16kb
app.use(express.json({ limit: "16kb" }));
// send encoded data from the url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// static files come from the public folder
app.use(express.static("public"));

// import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";

// all routes

app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
