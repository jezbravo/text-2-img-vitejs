import { useState } from "react";
import getCurrentDateTime from "../script/date";
import { saveAs } from "file-saver";
import { Copy, Trash2, ChevronDown, Menu, Upload, Image as ImageIcon, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModelSidebar from "../components/ModelSidebar";

function ImageToImage() {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("Transform this image into a van gogh painting");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(""); // Default selected by Sidebar
  const [provider, setProvider] = useState("auto");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const providers = [
    "auto",
    "cerebras",
    "cohere", 
    "fal-ai",
    "featherless-ai",
    "fireworks-ai",
    "groq",
    "hf-inference",
    "hyperbolic",
    "nebius",
    "novita",
    "nscale",
    "ovhcloud",
    "publicai",
    "replicate",
    "sambanova",
    "scaleway",
    "together",
    "wavespeed",
    "zai-org"
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("prompt", textInput);
      formData.append("model", selectedModel);
      formData.append("provider", provider);
      
      console.log("Sending request with provider:", provider);

      const response = await fetch("http://localhost:3001/api/imageToImage", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = errorText;
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorText;
        } catch {
          // not json
        }
        
        if (errorMsg.includes("not supported for provider")) {
          throw new Error(`The selected model provider does not support Image-to-Image at this time. Please try selecting a different model from the sidebar. (Error: ${errorMsg})`);
        }
        throw new Error(errorMsg || "Error generating image");
      }

      const blob = await response.blob();
      const { date, time } = getCurrentDateTime();
      const modelName = selectedModel.replace("/", "-");
      const filename = `img2img_${date}_${time}_${modelName}.jpg`;

      alert("Image generation successful!");
      saveAs(blob, filename);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ModelSidebar 
        selectedModel={selectedModel} 
        onSelectModel={setSelectedModel} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        task="image-to-image"
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-[320px]' : 'ml-0'}`}>
        <header className="sticky top-0 z-30 glass border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             {!isSidebarOpen && (
               <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 cursor-pointer">
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
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <ImageIcon size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Image to Image</h1>
             </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Selected Model</span>
              <span className="text-xs font-semibold text-emerald-600 truncate max-w-[200px]">
                {selectedModel.split('/').pop()}
              </span>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-2xl rounded-xl bg-white/80 p-6 shadow-2xl backdrop-blur-md ring-1 ring-gray-200 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Source Image</label>
                <div className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-gray-50 ${imagePreview ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-200'}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg shadow-md" />
                  ) : (
                    <>
                      <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                        <Upload size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">Click or drag to upload source image</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="provider" className="block text-sm font-semibold text-gray-700">Inference Provider</label>
                <div className="relative">
                  <select
                    id="provider"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white p-3 pr-10 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700 cursor-pointer"
                  >
                    {providers.map((p) => (
                      <option key={p} value={p}>
                        {p === "auto" ? "Automatic Selection" : p}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-500">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700">Transformation Prompt</label>
                <div className="relative">
                  <textarea
                    id="prompt"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white p-3 pr-10 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="How should the image change?"
                  ></textarea>
                  <div className="absolute right-2 top-2 flex flex-col space-y-2 bg-white/90 p-1 rounded-md shadow-sm border border-gray-100">
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-500 transition-colors cursor-pointer"
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

              <button
                type="submit"
                disabled={loading || !selectedImage || !selectedModel}
                className={`w-full flex items-center justify-center rounded-lg p-3 text-white font-semibold shadow-lg transition-all duration-200 ${loading || !selectedImage || !selectedModel ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl active:scale-[0.98] cursor-pointer'}`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Transforming...</span>
                  </div>
                ) : "Generate New Image"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
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

export default ImageToImage;
