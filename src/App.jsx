import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TextToImage from "./pages/TextToImage";
import ImageToImage from "./pages/ImageToImage";
import ImageToVideo from "./pages/ImageToVideo";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/text-to-image" element={<TextToImage />} />
        <Route path="/image-to-image" element={<ImageToImage />} />
        <Route path="/image-to-video" element={<ImageToVideo />} />
      </Routes>
    </Router>
  );
}

export default App;
