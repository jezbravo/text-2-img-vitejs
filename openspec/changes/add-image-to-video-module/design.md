# Design: Image-to-Video Module

## Architecture Overview
The image-to-video module follows the same client-server pattern as existing ImageToImage functionality, with modifications to handle video output instead of images.

## Component Structure

### Frontend Components
```
src/pages/ImageToVideo.jsx (new)
├── State management for image upload, model selection, loading
├── Form for image upload and model configuration
├── Video preview/player (optional, for generated video)
├── Download handler for MP4 files
└── Error handling and user feedback

src/components/ModelSidebar.jsx (modified)
├── Add "image-to-video" task type support
├── Filter models by pipeline_tag="image-to-video"
├── Use HF Partner API to fetch image-to-video models
└── Maintain existing favorites/dislikes pattern

src/App.jsx (modified)
├── Add route: <Route path="/image-to-video" element={<ImageToVideo />} />
└── Update LandingPage to include link to new module
```

### Backend API
```
server.js (modified)
├── POST /api/imageToVideo
│   ├── Upload image via multer (memory storage)
│   ├── Validate model supports image-to-video
│   ├── Call Hugging Face Inference API or provider directly
│   ├── Handle video response (blob/buffer)
│   ├── Return MP4 file to client
│   └── Comprehensive error logging
└── POST /log (modified)
    └── Log video generation requests
```

## API Integration

### Hugging Face Inference API Approach
**Option A: Use InferenceClient (if supported)**
```javascript
const response = await hf.imageToVideo({
  model: "stabilityai/stable-video-diffusion-img2vid",
  inputs: imageBlob,
  parameters: {
    fps: 6,
    motion_bucket_id: 127
  }
});
```

**Option B: Direct provider API (if InferenceClient lacks support)**
```javascript
const response = await fetch(`https://fal.run/${modelId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Key ${process.env.FAL_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image_url: uploadedImageUrl,
    model: "stabilityai/stable-video-diffusion-img2vid"
  })
});
```

**Decision**: Implement Option A first. If `hf.imageToVideo()` method doesn't exist or is incomplete, fall back to direct fal-ai API calls.

## Data Flow

### Image-to-Video Generation Flow
```
1. User selects image file
   ↓
2. Frontend displays preview
   ↓
3. User selects model from ModelSidebar (filtered for image-to-video)
   ↓
4. User selects provider (defaults to "fal-ai" for image-to-video)
   ↓
5. User clicks "Generate Video" button
   ↓
6. Frontend sends FormData with:
   - image file
   - selected model
   - selected provider
   ↓
7. Backend validates request and calls HF/Provider API
   ↓
8. API returns video blob (MP4)
   ↓
9. Backend sends MP4 to frontend
   ↓
10. Frontend triggers browser download
   ↓
11. Backend logs generation to log.txt
```

## Model Selection Strategy

### Supported Models (Initial)
- `stabilityai/stable-video-diffusion-img2vid` - Standard SVD model
- `stabilityai/stable-video-diffusion-img2vid-xt` - Extended model
- Additional models as available from providers

### Provider Priority
1. fal-ai (primary - has confirmed image-to-video support)
2. Other providers that support image-to-video models
3. hf-inference (fallback, if available)

### Model Filtering
```javascript
// In ModelSidebar.jsx fetchModels()
const task = "image-to-video";  // New task type
const providerPromises = IMAGE_TO_VIDEO_PROVIDERS.map(async (provider) => {
  const res = await fetch(`https://huggingface.co/api/partners/${provider}/models`);
  const data = await res.json();
  return data["image-to-video"] || {};  // Filter by task type
});
```

## State Management

### Component State
```javascript
const [selectedImage, setSelectedImage] = useState(null);
const [imagePreview, setImagePreview] = useState(null);
const [loading, setLoading] = useState(false);
const [selectedModel, setSelectedModel] = useState(defaultModel);
const [provider, setProvider] = useState("fal-ai");  // Default to fal-ai
const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);  // For preview
```

## File Handling

### Image Upload
- Accept: image/* (JPG, PNG, etc.)
- Max size: 10MB (typical for SVD models)
- Storage: Multer memory storage (no disk I/O)

### Video Download
- Format: MP4
- Filename: `vid2vid_${date}_${time}_${modelName}.mp4`
- Method: file-saver library (existing dependency)
- Preview: Optional, uses object URL if implemented

## Error Handling

### Error Categories
1. **Validation Errors**: No image selected, invalid file type, file too large
2. **Model Compatibility**: Model doesn't support image-to-video for selected provider
3. **API Errors**: Rate limits, model unavailable, provider errors
4. **Network Errors**: Timeout, connection issues
5. **Processing Errors**: Video generation failure

### Error Messages
Follow existing pattern from ImageToImage.jsx:
```javascript
if (error.message.includes("not supported for provider")) {
  errorMessage = "The selected model provider does not support Image-to-Video at this time. Please try selecting a different model from the sidebar.";
}
```

## UI/UX Design

### Layout
- **Sidebar**: Model selection (collapsible, same as other pages)
- **Main Content**:
  - Header with page title and navigation
  - Image upload area (drag-and-drop + click)
  - Provider selection dropdown
  - Generate button with loading state
  - Video preview area (optional)
- **Toast**: Feedback messages (success/error)

### Color Scheme
Use emerald/green theme (consistent with ImageToImage):
- Header icon: emerald-600
- Primary button: from-emerald-500 to-teal-600
- Focus states: emerald-500
- Selected model indicator: emerald-600

### Loading States
- Show penguin.gif animation during generation
- Disable generate button
- Display progress indication if possible

## Performance Considerations

### Generation Time
- Video generation typically takes 10-60 seconds
- Longer than image generation
- Show clear loading state with timeout protection

### File Size
- Generated videos: ~5-20MB for 2-4 second clips
- Larger than images
- Consider file size in UX design

### Caching
- No client-side caching (videos are unique)
- Consider server-side caching if needed later

## Security Considerations

### API Keys
- Use environment variables (VITE_FAL_API_KEY if direct API needed)
- Never expose tokens in client-side code
- Proxy through backend if needed

### File Upload
- Validate file type and size on client and server
- Sanitize filenames
- Rate limiting considerations

## Testing Strategy

### Manual Testing
1. Upload image and generate video with default model
2. Test with different image sizes/formats
3. Test model selection changes
4. Test provider selection
5. Test error scenarios (no image, invalid model, etc.)
6. Test video download functionality

### Validation
- ESLint: `npm run lint` must pass
- Build: `npm run build` must succeed
- Lint with 0 warnings

## Migration Path

### Phase 1: Basic Implementation
- Create ImageToVideo page
- Add backend endpoint
- Basic model selection (static list)
- Video generation and download

### Phase 2: Model Integration
- Update ModelSidebar for image-to-video task
- Fetch models from HF Partners API
- Dynamic model selection

### Phase 3: Enhancements (Future)
- Video preview/playback
- Multiple video generation options
- Batch processing
- Video editing capabilities

## Alternative Approaches Considered

### Direct Diffusers Integration
- **Pros**: More control, Python backend
- **Cons**: Requires Python runtime, breaks Node.js architecture
- **Decision**: Not pursuing

### Third-Party Video Generation APIs
- **Pros**: Specialized video services (RunwayML, Pika)
- **Cons**: Additional dependencies, cost considerations
- **Decision**: Stick with Hugging Face for consistency

### Browser-Based Video Generation
- **Pros**: No server needed
- **Cons**: Limited models, performance issues
- **Decision**: Not feasible for current requirements