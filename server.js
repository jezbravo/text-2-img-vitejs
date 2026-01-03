import express, { json } from "express";
import { appendFile } from "fs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only this origin
  }),
);

app.use(json());

import { InferenceClient } from "@huggingface/inference";

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
