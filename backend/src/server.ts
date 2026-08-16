import "dotenv/config";
import express from "express";
import cors from "cors";
import voiceRoutes from "./routes/voice.routes.js";

const port = Number(process.env.PORT) || 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

const app = express();
app.use(cors({ origin: [frontendOrigin, `http://localhost:${port}`] }));
app.use(express.json());
app.use("/api/voice", voiceRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ message });
  },
);

app.listen(port, () => {
  console.log(`voice backend on :${port}`);
});
