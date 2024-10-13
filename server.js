import express, { json } from "express";
import { appendFile } from "fs";
import cors from "cors";

const app = express();
// app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only this origin
  }),
);

app.use(json());

app.post("/log", (req, res) => {
  const { filename, textInput } = req.body;
  const logMessage = `FILENAME: ${filename}\nPROMPT: ${textInput}\n-------\n`;
  appendFile("log.txt", logMessage, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Log written successfully!");
      res.send("Log written successfully!");
    }
  });
});

app.listen(3001, () => {
  console.log("Server listening on port 3001");
});
