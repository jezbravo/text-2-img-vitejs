# Tasks: Image-to-Video Module Implementation

## Ordered Task List

### 1. Prepare Project Structure
- [x] Create `src/pages/ImageToVideo.jsx` file
- [x] Verify existing dependencies support video handling (file-saver works with MP4)
- [x] Test that backend can handle video file responses

### 2. Create Backend API Endpoint
- [x] Add `POST /api/imageToVideo` endpoint to `server.js`
- [x] Configure multer for image upload with memory storage
- [x] Implement Hugging Face Inference API call for image-to-video
- [x] Handle video blob response and convert to buffer
- [x] Set proper Content-Type header (video/mp4)
- [x] Add comprehensive error logging with timestamps
- [x] Test endpoint with curl or Postman

### 3. Create Frontend Page Component
- [x] Create `ImageToVideo.jsx` functional component in `src/pages/`
- [x] Add state management for: selectedImage, imagePreview, loading, selectedModel, provider
- [x] Implement image upload handler with FileReader for preview
- [x] Create upload form UI with drag-and-drop support
- [x] Add provider selection dropdown (defaults to "fal-ai")
- [x] Implement "Generate Video" button with loading state
- [x] Add penguin.gif loading animation
- [x] Implement video download using file-saver library
- [x] Add error handling with user-friendly messages
- [x] Add toast notifications for user feedback

### 4. Update ModelSidebar for Image-to-Video
- [x] Add "image-to-video" to task type parameter support
- [x] Create IMAGE_TO_VIDEO_PROVIDERS constant (fal-ai, others as available)
- [x] Test `fetchModels()` with task="image-to-video" to verify HF API returns models
- [x] Update model filtering logic to handle image-to-video pipeline tag
- [x] Ensure favorites/dislikes work with new task type
- [x] Verify models display correctly in sidebar

### 5. Add Routing
- [x] Import ImageToVideo component in `src/App.jsx`
- [x] Add route: `<Route path="/image-to-video" element={<ImageToVideo />} />`
- [x] Test navigation to /image-to-video URL

### 6. Update Landing Page
- [x] Add "Image to Video" card/button to LandingPage.jsx
- [x] Link to /image-to-video route
- [x] Ensure consistent styling with other feature cards
- [x] Add descriptive text about image-to-video functionality

### 7. Implement Video Generation Flow
- [x] Connect frontend form submit to `/api/imageToVideo` endpoint
- [x] Send FormData with: image file, selected model, selected provider
- [x] Handle video blob response in frontend
- [x] Generate filename: `vid2vid_${date}_${time}_${modelName}.mp4`
- [x] Trigger download using saveAs() from file-saver
- [x] Call `/api/log` endpoint to log generation
- [x] Test end-to-end generation with a sample image

### 8. Implement Default Model Selection
- [x] Identify stable image-to-video model (e.g., stabilityai/stable-video-diffusion-img2vid)
- [x] Set as default in ImageToVideo component state
- [x] Verify model exists in fetched models from HF API
- [x] Test generation with default model

### 9. Add Error Handling
- [x] Implement validation for missing image selection
- [x] Add file type and size validation (image/*, max 10MB)
- [x] Handle model compatibility errors with specific message
- [x] Handle provider API errors with user-friendly messages
- [x] Implement timeout handling (60 second default)
- [x] Add console logging for debugging all errors

### 10. Style and Polish UI
- [x] Apply emerald/green color theme (consistent with ImageToImage)
- [x] Style upload area with dashed border and hover states
- [x] Add transitions and animations using Framer Motion
- [x] Ensure responsive design for mobile and desktop
- [x] Add tooltips and accessibility attributes
- [x] Test in different browsers (Chrome, Firefox, Safari)

### 11. Add Logging Integration
- [x] Ensure log.txt file exists or create if not
- [x] Update log endpoint to handle video generation entries
- [x] Format log entry: `FILENAME: {filename}\nMODEL: {model}\nTIMESTAMP: {date} {time}\n-------\n`
- [x] Test that log entries are written correctly

### 12. Code Quality and Standards
- [x] Run `npm run lint` - ensure 0 warnings
- [x] Run `npm run build` - ensure no build errors
- [x] Verify no comments in code (project standard)
- [x] Check code follows existing patterns (imports, state management, error handling)
- [x] Ensure all component names use PascalCase
- [x] Verify Tailwind CSS classes are properly organized

### 13. Testing and Validation
- [x] Test image upload with various formats (JPG, PNG, WebP)
- [x] Test with invalid files (PDF, TXT) - verify error handling
- [x] Test with large files (>10MB) - verify rejection
- [x] Test model selection from sidebar - verify different models work
- [x] Test provider selection - verify fal-ai and auto work
- [x] Test error scenarios: no image, API errors, timeout
- [x] Test video download - verify file is playable MP4
- [x] Test navigation between pages - verify routing works
- [x] Test mobile view - verify responsive design
- [x] Test browser compatibility - verify works in major browsers

### 14. Documentation
- [x] Update openspec/project.md if needed with image-to-video details
- [x] Document environment variables (if any new ones needed)
- [x] Update README.md with new feature description
- [x] Add example usage in project documentation

## Dependencies and Blocking

### Parallel Work
These tasks can be done in parallel:
- Task 2 (Backend API) and Task 3 (Frontend Page) - independent development
- Task 4 (ModelSidebar) and Task 6 (Landing Page) - different components
- Task 8 (Default Model) and Task 10 (UI Styling) - different concerns

### Blocking Relationships
- Task 7 (Video Generation Flow) requires Task 2 (Backend) and Task 3 (Frontend) to be complete
- Task 12 (Code Quality) should happen after all code changes
- Task 13 (Testing) requires all implementation tasks to be complete
- Task 4 (ModelSidebar) must be done before Task 8 (Default Model selection)

### External Dependencies
- **Critical**: Hugging Face API must support image-to-video for selected provider (fal-ai confirmed)
- **Critical**: VITE_HF_TOKEN environment variable must be set
- **Optional**: VITE_FAL_API_KEY if direct API calls are needed

## Validation Criteria

Each task is considered complete when:
- [ ] Code is written and follows project conventions
- [ ] No console errors in browser
- [ ] No console errors in server
- [ ] Functionality works as described in requirements
- [ ] ESLint passes for changed files
- [ ] Build succeeds without errors

## Rollback Plan
If issues arise during implementation:
1. Revert `server.js` to remove `/api/imageToVideo` endpoint
2. Remove `src/pages/ImageToVideo.jsx`
3. Revert `src/App.jsx` to remove route
4. Revert `src/components/ModelSidebar.jsx` to remove image-to-video support
5. Revert `src/pages/LandingPage.jsx` to remove Image-to-Video link

## Success Metrics
- Image-to-video page loads and displays correctly
- User can upload an image and see preview
- Video generation completes and downloads MP4 file
- Model selection works from sidebar
- Error handling provides clear feedback
- All tests pass without errors
- Lint check passes with 0 warnings
- Build completes successfully