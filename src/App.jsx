import { useState } from "react";
import { HfInference } from "@huggingface/inference";
import getCurrentDateTime from "./script/date";
import { saveAs } from "file-saver";
import { mainModel } from "../models";

const hf = new HfInference(import.meta.env.VITE_HF_TOKEN);

function Home() {
  const [textInput, setTextInput] = useState(
    "Harley Quinn, beautiful, masterpiece",
  );
  const [loading, setLoading] = useState(false);

  // Function to handle changes in the textarea
  const handleTextareaChange = (event) => {
    setTextInput(event.target.value); // Update the state with the new value of the textarea
  };

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      console.log("Prompt:", textInput);
      const img = await generateImage();

      // Reset loading to false after request completes
      setLoading(false);
      return img;
    } catch (error) {
      setLoading(false);
      console.error("Error generating image:", error);
      alert(`Error generating image: ${error}`);
    }
  };

  async function generateImage() {
    const { date, time } = getCurrentDateTime();
    // const model = import.meta.env.VITE_TXT_TO_IMG_MODEL;
    const model = mainModel;
    console.log("model: ", model);

    /*
    const res = await hf.textToImage({
      inputs: textInput,
      model: model,
      endpointUrl: `https://api-inference.huggingface.co/models/${model}`,
    });
    */

    const response = await fetch("http://localhost:3001/api/generateImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: textInput, model: mainModel }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const res = await response.blob();

    // console.log(res);

    const imageData = res;

    if (imageData) {
      const blob = new Blob([await imageData.arrayBuffer()], {
        type: "image/jpeg",
      });

      const modelName = model.replace("/", "-");
      // console.log("modelName: ", modelName);

      const filename = `img_${date}_${time}_${modelName}.jpg`;

      alert("Image generation successful!");
      saveAs(blob, filename);

      // POST request to the server
      fetch("http://localhost:3001/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, textInput }),
      })
        .then((response) => response.text())
        .then((message) => console.log(message))
        .catch((error) => console.error(error));

      console.log("Image generation successful!");
    } else {
      console.error("No image data found in the response");
      alert("No image data found in the response");
    }

    return res;
  }
  return (
    <>
      <main className="mt-14 flex items-center justify-center">
        <div className="w-full rounded-lg bg-blue-200 p-4 md:w-3/4 lg:w-1/2 xl:w-1/3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="prompt"
              className="mb-4 block text-center text-2xl font-bold"
            >
              Text to Image Conversion
            </label>
            <textarea
              name="prompt"
              id="prompt"
              placeholder="Describe your vision..."
              rows={5}
              cols={40}
              className="w-full overflow-auto p-2"
              value={textInput}
              onChange={handleTextareaChange}
            ></textarea>
            <button
              className="relative flex w-full items-center justify-center rounded-lg bg-blue-400 p-2 text-white hover:bg-blue-600"
              type="submit"
              disabled={loading}
              autoFocus
            >
              {loading ? (
                <>
                  <span className="mr-2">Generating. Please Wait...</span>
                  <img
                    src="/penguin.gif"
                    alt="penguin"
                    width={200}
                    height={200}
                    className="absolute inset-0 mx-auto pt-14"
                  />
                </>
              ) : (
                "Generate"
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default Home;
