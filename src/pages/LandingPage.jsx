import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Image as ImageIcon, Wand2, ArrowRight, Video } from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Text to Image",
      description: "Transform your words into breathtaking visual art with state-of-the-art AI models.",
      icon: <Wand2 className="w-8 h-8 text-indigo-500" />,
      path: "/text-to-image",
      color: "from-indigo-500/20 to-purple-500/20",
      borderColor: "hover:border-indigo-500/50",
    },
    {
      title: "Image to Image",
      description: "Evolve your existing images using prompts to guide the AI's creative brush.",
      icon: <ImageIcon className="w-8 h-8 text-emerald-500" />,
      path: "/image-to-image",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "hover:border-emerald-500/50",
    },
    {
      title: "Image to Video",
      description: "Bring your static images to life by converting them into short, stunning video clips.",
      icon: <Video className="w-8 h-8 text-violet-500" />,
      path: "/image-to-video",
      color: "from-violet-500/20 to-fuchsia-500/20",
      borderColor: "hover:border-violet-500/50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <nav className="relative z-10 px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">Antigravity AI</span>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 leading-tight">
            Infinite Creativity <br />
            <span className="text-indigo-400">Powered by AI</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The ultimate playground for AI-driven visual generation. Choose your path and start creating masterpieces in seconds.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mt-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
              onClick={() => navigate(feature.path)}
              className={`group relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl cursor-pointer transition-all duration-500 ${feature.borderColor} hover:bg-white/10`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
              
              <div className="relative z-10">
                <div className="mb-6 p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-indigo-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-gray-500">
        <p>© 2026 Antigravity AI. Powered by Hugging Face.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
