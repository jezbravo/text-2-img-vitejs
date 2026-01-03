import { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  ThumbsDown, 
  Search, 
  RotateCw, 
  Star, 
  Check, 
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const API_BASE = 'https://huggingface.co/api/models';

const ModelSidebar = ({ selectedModel, onSelectModel, isOpen, onClose, task = "text-to-image" }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem(`hf_favorites_${task}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [disliked, setDisliked] = useState(() => {
    const saved = localStorage.getItem(`hf_disliked_${task}`);
    return saved ? JSON.parse(saved) : [];
  });

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}?filter=${task},endpoints_compatible&sort=downloads&direction=-1&limit=100`);
      const data = await res.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching HF models:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [task]);

  useEffect(() => {
    localStorage.setItem(`hf_favorites_${task}`, JSON.stringify(favorites));
  }, [favorites, task]);

  useEffect(() => {
    localStorage.setItem(`hf_disliked_${task}`, JSON.stringify(disliked));
  }, [disliked, task]);

  const toggleFavorite = (e, modelId) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId) 
        : [...prev, modelId]
    );
    // If favorited, remove from disliked
    if (!favorites.includes(modelId)) {
      setDisliked(prev => prev.filter(id => id !== modelId));
    }
  };

  const toggleDislike = (e, modelId) => {
    e.stopPropagation();
    setDisliked(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId) 
        : [...prev, modelId]
    );
    // If disliked, remove from favorites
    if (!disliked.includes(modelId)) {
      setFavorites(prev => prev.filter(id => id !== modelId));
    }
  };

  const filteredModels = useMemo(() => {
    let result = models.filter(m => 
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sorting logic: 
    // 1. Favorites at top
    // 2. Regular models in middle (sorted by original order/downloads)
    // 3. Disliked at bottom
    return result.sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      const aDis = disliked.includes(a.id);
      const bDis = disliked.includes(b.id);

      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      
      if (aDis && !bDis) return 1;
      if (!aDis && bDis) return -1;

      return 0; // Maintain relative order if both are same category
    });
  }, [models, searchTerm, favorites, disliked]);

  return (
    <motion.aside
      initial={{ x: -320 }}
      animate={{ x: isOpen ? 0 : -320 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed left-0 top-0 h-screen w-[320px] bg-white border-r border-gray-200 shadow-2xl z-50 flex flex-col"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchModels}
            disabled={loading}
            className={`p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer group ${loading ? 'opacity-50' : ''}`}
            title="Refresh models"
          >
            <RotateCw className={`w-5 h-5 text-blue-600 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          </button>
          <h2 className="font-bold text-gray-800 tracking-tight">HF Models</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ChevronRight className={`w-5 h-5 text-gray-500 transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="p-4 bg-white sticky top-14 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
            <p className="text-xs text-gray-500 font-medium">Loading models...</p>
          </div>
        ) : filteredModels.length > 0 ? (
          filteredModels.map((model) => {
            const isFav = favorites.includes(model.id);
            const isDis = disliked.includes(model.id);
            const isSelected = selectedModel === model.id;

            return (
              <motion.div
                key={model.id}
                layout
                onClick={() => onSelectModel(model.id)}
                className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-500/50' 
                    : isDis
                      ? 'bg-red-50/30 border-red-100 opacity-60 grayscale-[0.5]' 
                      : 'border-gray-100 hover:border-gray-300 bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-8">
                    <p className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                      {model.id.split('/')[1] || model.id}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">
                      {model.id.split('/')[0]}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={(e) => toggleFavorite(e, model.id)}
                      className={`p-1 rounded-md transition-colors ${
                        isFav ? 'text-rose-500 bg-rose-50' : 'text-gray-300 hover:text-rose-400 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={(e) => toggleDislike(e, model.id)}
                      className={`p-1 rounded-md transition-colors ${
                        isDis ? 'text-gray-700 bg-gray-200' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-medium">
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-0.5 text-amber-400 fill-current" />
                      {model.likes?.toLocaleString() || 0}
                    </span>
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                      {model.downloads > 1000 ? `${(model.downloads/1000).toFixed(1)}k` : model.downloads} dl
                    </span>
                  </div>
                  {isSelected && (
                    <span className="bg-blue-500 text-white p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No models found</p>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-[11px] text-gray-500">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Click a model to select it for generation.</span>
        </div>
      </div>
    </motion.aside>
  );
};

ModelSidebar.propTypes = {
  selectedModel: PropTypes.string.isRequired,
  onSelectModel: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  task: PropTypes.string
};

export default ModelSidebar;
