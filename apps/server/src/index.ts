import { env } from "@yondu-exam/env/server";
import cors from "cors";
import express from "express";
import todosV1Routes from "./module/v1/todos/route";

const app = express();

// CORS middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

// Base API router
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get("/", (_req, res) => res.status(200).send("OK"));

app.use("/api/v1/todos", todosV1Routes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
