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
  const { prompt, negative_prompt, model, width, height, provider } = req.body;
  console.log("Request body:", req.body);

  try {
    const response = await hf.textToImage({
      model: model,
      inputs: prompt,
      provider: provider || "auto",
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
    console.error("Provider:", provider || "auto");
    console.error("Model:", model);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
    console.error("Full error:", error);
    console.error("------- ERROR END -------");
    
    let errorMessage = error.message || "Internal server error";
    
    if (error.constructor.name === "InferenceClientProviderOutputError") {
      errorMessage = `The selected model '${model}' is not compatible with the '${provider || "auto"}' provider. Please try selecting a different provider from the dropdown, or use 'auto' for automatic selection. (Error: ${error.message})`;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

app.post("/api/imageToImage", upload.single("image"), async (req, res) => {
  const { prompt, model, provider } = req.body;
  const image = req.file;
  const selectedProvider = provider || "auto";

  console.log("=== IMAGE TO IMAGE REQUEST ===");
  console.log("Model:", model);
  console.log("Provider (raw):", provider);
  console.log("Provider (will use):", selectedProvider);
  console.log("==============================");

  if (!image) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    console.log("Calling hf.imageToImage with provider:", selectedProvider);
    
    const response = await hf.imageToImage({
      model: model,
      inputs: new Blob([image.buffer]),
      provider: selectedProvider,
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
    console.error("Provider:", selectedProvider);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
    console.error("Full error:", error);
    console.error("------- IMG2IMG ERROR END -------");
    
    let errorMessage = error.message || "Internal server error";
    
    if (error.constructor.name === "InferenceClientProviderOutputError") {
      errorMessage = `The selected model '${model}' is not compatible with the '${selectedProvider}' provider. Please try selecting a different provider from the dropdown, or use 'auto' for automatic selection. (Error: ${error.message})`;
    }
    
    res.status(500).json({ error: errorMessage });
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
