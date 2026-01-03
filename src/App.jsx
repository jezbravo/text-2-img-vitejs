import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import TextToImage from "./pages/TextToImage";
import ImageToImage from "./pages/ImageToImage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/text-to-image" element={<TextToImage />} />
        <Route path="/image-to-image" element={<ImageToImage />} />
      </Routes>
    </Router>
  );
}

export default App;
