import { useState } from "react";
import getCurrentDateTime from "../script/date";
import { saveAs } from "file-saver";
import { mainModel as defaultModel } from "../../models";
import { Copy, Trash2, ChevronDown, Menu, Sparkles, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModelSidebar from "../components/ModelSidebar";

function TextToImage() {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState(
    "A cute robot in a cyberpunk city",
  );
  const [negativePrompt, setNegativePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [shape, setShape] = useState("square");
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

  const handleWidthChange = (e) => {
    const val = e.target.value === "" ? "" : parseInt(e.target.value);
    setWidth(val);
  };

  const handleHeightChange = (e) => {
    const val = e.target.value === "" ? "" : parseInt(e.target.value);
    setHeight(val);
  };

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(textInput);
    triggerToast("Prompt copied to clipboard!");
  };

  const clearText = () => {
    setTextInput("");
  };

  const copyNegativePrompt = () => {
    navigator.clipboard.writeText(negativePrompt);
    triggerToast("Negative prompt copied to clipboard!");
  };

  const clearNegativePrompt = () => {
    setNegativePrompt("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const img = await generateImage();
      setLoading(false);
      return img;
    } catch (error) {
      setLoading(false);
      console.error("Error generating image:", error);
      
      let errorMessage = error.message;
      if (error.message.includes("No Inference Provider available")) {
        errorMessage = "This model is not currently available via the free Hugging Face API or requires a different provider. Please select another model from the sidebar.";
      } else if (error.message.includes("not supported for provider")) {
        errorMessage = `The current provider for this model doesn't support this task. Please try another model. (Note: ${error.message})`;
      } else if (error.message.includes("500") || error.message.includes("Server Error")) {
        errorMessage = "Internal Server Error. The model might be too large or currently unavailable.";
      }
      
      alert(errorMessage);
    }
  };

  async function generateImage() {
    const { date, time } = getCurrentDateTime();
    const model = selectedModel;

    const response = await fetch("http://localhost:3001/api/generateImage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: textInput, 
        negative_prompt: negativePrompt,
        model: selectedModel, 
        width, 
        height 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
      const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || errorText);
      } catch {
        throw new Error(errorText || "Unknown error occurred");
      }
    }

    const res = await response.blob();
    const imageData = res;

    if (imageData) {
      const blob = new Blob([await imageData.arrayBuffer()], {
        type: "image/jpeg",
      });

      const modelName = model.replace("/", "-");
      const filename = `img_${date}_${time}_${modelName}.jpg`;

      alert("Image generation successful!");
      saveAs(blob, filename);

      fetch("http://localhost:3001/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, textInput }),
      })
        .then((response) => response.text())
        .then((message) => console.log(message))
        .catch((error) => console.error(error));
    } else {
      alert("No image data found in the response");
    }

    return res;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ModelSidebar 
        selectedModel={selectedModel} 
        onSelectModel={setSelectedModel} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        task="text-to-image"
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[320px]' : 'ml-0'}`}>
        <header className="sticky top-0 z-30 glass border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             {!isSidebarOpen && (
               <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer"
               >
                 <Menu size={20} />
               </button>
             )}
             <div className="flex items-center space-x-2">
                <button 
                  onClick={() => navigate("/")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 cursor-pointer mr-2"
                  title="Go to Home"
                >
                  <Home size={20} />
                </button>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Text to Image</h1>
             </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Selected Model</span>
              <span className="text-xs font-semibold text-indigo-600 truncate max-w-[200px]">
                {selectedModel.split('/').pop()}
              </span>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl rounded-xl bg-white/80 p-6 shadow-2xl backdrop-blur-md ring-1 ring-gray-200 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-center text-3xl font-bold text-gray-800 tracking-tight">
              Create Magic
            </h1>
            
            <div className="space-y-2">
              <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700">
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
               <label htmlFor="negativePrompt" className="block text-sm font-semibold text-gray-700">
                Negative Prompt
              </label>
              <div className="relative">
                <textarea
                  name="negativePrompt"
                  id="negativePrompt"
                  placeholder="What to exclude (e.g. ugly, blurry, bad anatomy)..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 shadow-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 transition-all font-sans text-gray-700"
                  value={negativePrompt}
                  onChange={handleNegativePromptChange}
                ></textarea>
                <div className="absolute right-2 top-2 flex flex-col space-y-2 bg-white/90 p-1 rounded-md shadow-sm border border-gray-100">
                  <button
                    type="button"
                    onClick={copyNegativePrompt}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500 transition-colors cursor-pointer"
                    title="Copy negative prompt"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={clearNegativePrompt}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors cursor-pointer"
                    title="Clear negative prompt"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
               <label htmlFor="shape" className="block text-sm font-semibold text-gray-700">
                  Image Shape
               </label>
               <div className="relative">
                 <select
                    id="shape"
                    value={shape}
                    onChange={handleShapeChange}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 cursor-pointer"
                 >
                    <option value="square">Square (512 x 512)</option>
                    <option value="portrait">Portrait (512 x 768)</option>
                    <option value="landscape">Landscape (768 x 512)</option>
                    <option value="custom">Custom Dimensions</option>
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                    <ChevronDown size={18} />
                 </div>
               </div>
            </div>

            {shape === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="width" className="block text-sm font-semibold text-gray-700">
                    Width
                  </label>
                  <input
                    type="number"
                    id="width"
                    value={width}
                    onChange={handleWidthChange}
                    min="64"
                    max="2048"
                    step="8"
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="height" className="block text-sm font-semibold text-gray-700">
                    Height
                  </label>
                  <input
                    type="number"
                    id="height"
                    value={height}
                    onChange={handleHeightChange}
                    min="64"
                    max="2048"
                    step="8"
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-700"
                  />
                </div>
              </div>
            )}
              
            <button
              className="relative flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer"
              type="submit"
              disabled={loading}
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
        </div>
      </main>

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${showToast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
        <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 border border-gray-700">
          <div className="bg-green-500 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      </div>
    </div>
  );
}

export default TextToImage;
