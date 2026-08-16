import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { transcribeAudio } from "../services/asr.service.js";

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

      const text = await transcribeAudio(req.file.buffer);
      res.json({ text });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
