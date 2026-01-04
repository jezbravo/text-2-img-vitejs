import { useState } from "react";
import getCurrentDateTime from "../script/date";
import { saveAs } from "file-saver";
import { ChevronDown, Menu, Upload, Video, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModelSidebar from "../components/ModelSidebar";

function ImageToVideo() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prompt, setPrompt] = useState("Make this image more dynamic with subtle motion");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("stabilityai/stable-video-diffusion-img2vid");
  const [provider, setProvider] = useState("hf-inference");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file (JPG, PNG, etc.)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
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
      formData.append("model", selectedModel);
      formData.append("provider", provider);

      console.log("Sending request with provider:", provider);

      const response = await fetch("http://localhost:3001/api/imageToVideo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = errorText;
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorText;
        } catch (parseError) {
          console.log("Failed to parse error response:", parseError);
        }

        if (errorMsg.includes("not supported for provider")) {
          throw new Error(`The selected model provider does not support Image-to-Video at this time. Please try selecting a different model from the sidebar. (Error: ${errorMsg})`);
        }
        throw new Error(errorMsg || "Error generating video");
      }

      const blob = await response.blob();
      const { date, time } = getCurrentDateTime();
      const modelName = selectedModel.replace("/", "-");
      const filename = `vid2vid_${date}_${time}_${modelName}.mp4`;

      alert("Video generation successful!");
      saveAs(blob, filename);
      setLoading(false);

      fetch("http://localhost:3001/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, model: selectedModel, prompt }),
      })
        .then((response) => response.text())
        .then((message) => console.log(message))
        .catch((error) => console.error(error));
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
        task="image-to-video"
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
                  <Video size={18} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Image to Video</h1>
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
                <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700">Motion Instruction</label>
                <textarea
                  id="prompt"
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-gray-700"
                  value={prompt}
                  onChange={handlePromptChange}
                  placeholder="Describe how the image should move or transform..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedImage}
                className={`w-full flex items-center justify-center rounded-lg p-3 text-white font-semibold shadow-lg transition-all duration-200 ${loading || !selectedImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl active:scale-[0.98] cursor-pointer'}`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                     <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span>Generating Video...</span>
                  </div>
                ) : "Generate Video"}
              </button>
            </form>
          </div>
        </div>
      </main>


    </div>
  );
}

export default ImageToVideo;