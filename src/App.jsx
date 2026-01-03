import { useState } from "react";
import { HfInference } from "@huggingface/inference";
import getCurrentDateTime from "./script/date";
import { saveAs } from "file-saver";
import { mainModel } from "../models";
import { Copy, Trash2 } from "lucide-react";

const hf = new HfInference(import.meta.env.VITE_HF_TOKEN);

function Home() {
  const [textInput, setTextInput] = useState(
    "Harley Quinn, beautiful, masterpiece",
  );
  const [negativePrompt, setNegativePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [shape, setShape] = useState("square");

  // Function to handle changes in the textarea
  const handleTextareaChange = (event) => {
    setTextInput(event.target.value);
  };
  
  const handleNegativePromptChange = (event) => {
    setNegativePrompt(event.target.value);
  };

  const handleShapeChange = (e) => {
    const newShape = e.target.value;
    setShape(newShape);
    if (newShape === "square") {
      setWidth(512);
      setHeight(512);
    } else if (newShape === "portrait") {
      setWidth(512);
      setHeight(768);
    } else if (newShape === "landscape") {
      setWidth(768);
      setHeight(512);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textInput);
  };

  const clearText = () => {
    setTextInput("");
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
    const model = mainModel;
    console.log("model: ", model);

    const response = await fetch("http://localhost:3001/api/generateImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: textInput, 
        negative_prompt: negativePrompt,
        model: mainModel, 
        width, 
        height 
      }),
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
      <main className="mt-14 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white/80 p-6 shadow-2xl backdrop-blur-md ring-1 ring-gray-200 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-center text-3xl font-bold text-gray-800 tracking-tight">
              Create Magic
            </h1>
            
            <div className="space-y-2">
              <label
                htmlFor="prompt"
                className="block text-sm font-semibold text-gray-700"
              >
                Positive Prompt
              </label>
              <div className="relative">
                <textarea
                  name="prompt"
                  id="prompt"
                  placeholder="Describe your vision..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans text-gray-700"
                  value={textInput}
                  onChange={handleTextareaChange}
                ></textarea>
                <div className="absolute right-2 top-2 flex flex-col space-y-2 bg-white/90 p-1 rounded-md shadow-sm border border-gray-100">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition-colors cursor-pointer"
                    title="Copy prompt"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={clearText}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors cursor-pointer"
                    title="Clear prompt"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
               <label
                htmlFor="negativePrompt"
                className="block text-sm font-semibold text-gray-700"
              >
                Negative Prompt
              </label>
              <textarea
                  name="negativePrompt"
                  id="negativePrompt"
                  placeholder="What to exclude (e.g. ugly, blurry, bad anatomy)..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 transition-all font-sans text-gray-700"
                  value={negativePrompt}
                  onChange={handleNegativePromptChange}
                ></textarea>
            </div>

            <div className="space-y-2">
               <label htmlFor="shape" className="block text-sm font-semibold text-gray-700">
                  Image Shape
               </label>
               <select
                  id="shape"
                  value={shape}
                  onChange={handleShapeChange}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-700"
               >
                  <option value="square">Square (512 x 512)</option>
                  <option value="portrait">Portrait (512 x 768)</option>
                  <option value="landscape">Landscape (768 x 512)</option>
               </select>
            </div>
              
            <button
              className="relative flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer"
              type="submit"
              disabled={loading}
              autoFocus
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  <span>Generating Magic...</span>
                </div>
              ) : (
                "Generate Image"
              )}
            </button>
            
            {loading && (
                 <div className="flex justify-center mt-4">
                  <img
                      src="/penguin.gif"
                      alt="penguin"
                      width={100}
                      height={100}
                      className="rounded-full shadow-inner"
                    />
                 </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}

export default Home;
