import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { handleTurn } from "../agent/agent.service.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.get("/ping", (_req: Request, res: Response) => {
  res.json({ message: "pong" });
});

router.post(
  "/transcribe",
  upload.single("audio"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file?.buffer?.length) {
        res.status(400).json({ message: "Missing audio file field 'audio'" });
        return;
      }

      const { transcript, replyText } = await handleTurn(req.file.buffer);
      res.json({ text: transcript, replyText });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
