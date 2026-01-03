import express, { json } from "express";
import { appendFile } from "fs";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(json());

const hf = new InferenceClient(process.env.VITE_HF_TOKEN);

app.post("/api/generateImage", async (req, res) => {
  const { prompt, negative_prompt, model, width, height } = req.body;
  console.log("Request body:", req.body);

  try {
    const response = await hf.textToImage({
      model: model,
      inputs: prompt,
      parameters: {
        negative_prompt: negative_prompt,
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
      },
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (error) {
    console.error("------- ERROR START -------");
    console.error("Time:", new Date().toISOString());
    console.error("Error during image generation:");
    console.error(error);
    console.error("------- ERROR END -------");
    
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/api/imageToImage", upload.single("image"), async (req, res) => {
  const { prompt, model } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    // Convert Buffer to a Blob/ArrayBuffer format that the SDK expects
    // for certain providers like fal-ai that might incorrectly assume browser-like objects.
    const response = await hf.imageToImage({
      model: model,
      inputs: new Blob([image.buffer]),
      parameters: {
        prompt: prompt,
      },
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (error) {
    console.error("------- IMG2IMG ERROR START -------");
    console.error("Time:", new Date().toISOString());
    console.error("Model:", model);
    console.error("Error during image-to-image generation:");
    console.error(error);
    console.error("------- IMG2IMG ERROR END -------");
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post("/log", (req, res) => {
  const { filename, textInput } = req.body;
  const logMessage = `FILENAME: ${filename}\nPROMPT: ${textInput}\n-------\n`;
  appendFile("log.txt", logMessage, (err) => {
    if (err) {
      console.error(err);
    } else {
      const actualDate = new Date();
      const formattedDate = `${actualDate.toLocaleDateString()} ${actualDate.toLocaleTimeString()}`;

      console.log(`Log written successfully! ${formattedDate}`);
      res.send(`Log written successfully! ${formattedDate}`);
    }
  });
});

app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
