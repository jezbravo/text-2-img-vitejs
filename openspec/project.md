# Project Context

## Purpose
This is a text-to-image and image-to-image web application that uses AI to convert user prompts into images. The application provides a simple interface where users can enter text descriptions and generate corresponding images using various AI models from Hugging Face. It will be integrated as a feature into the larger Editia Project.

## Tech Stack

### Frontend
- **React** (v19.1.0) - UI library
- **Vite** (v7.0.5) - Build tool and dev server
- **Tailwind CSS** (v4.1.11) - Styling framework
- **React Router DOM** (v7.11.0) - Client-side routing
- **Framer Motion** (v12.23.26) - Animation library
- **Lucide React** (v0.562.0) - Icon library
- **file-saver** (v2.0.5) - File download functionality

### Backend
- **Express** (v5.1.0) - Web server framework
- **Node.js** - Runtime environment
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **Multer** (v2.0.2) - File upload handling

### AI/ML
- **Hugging Face Inference** (@huggingface/inference v4.5.3) - AI model API client
- Supports multiple inference providers (auto, cerebras, cohere, fal-ai, fireworks-ai, etc.)

### Development Tools
- **ESLint** (v9.31.0) - Code linting with React plugins
- **Prettier** (v0.6.14) - Code formatting with Tailwind plugin
- **SWC** - Fast JavaScript/TypeScript compiler via @vitejs/plugin-react-swc

## Project Conventions

### Code Style

#### File Organization
- **Components**: Located in `src/components/` (e.g., ModelSidebar.jsx, Background.jsx)
- **Pages**: Located in `src/pages/` (e.g., LandingPage.jsx, TextToImage.jsx, ImageToImage.jsx)
- **Utilities**: Located in `src/script/` (e.g., date.js)
- **Server**: Express server in root `server.js`
- **Configuration**: Root level files (vite.config.js, tailwind.config.js, eslint.config.js)

#### Naming Conventions
- Component files: PascalCase (e.g., TextToImage.jsx)
- Component exports: Default exports for components
- Utility files: kebab-case (e.g., date.js)
- Environment variables: VITE_* prefix for client-side, server-side vars for backend
- Model identifiers: Numeric keys in models.js

#### Code Formatting
- **Prettier**: Auto-formats on save with Tailwind CSS class sorting
- **ESLint**: Enforces React best practices, prevents unused variables (max-warnings 0)
- **No comments**: Project policy is to minimize comments in code
- **Functional components**: React components use functional style with hooks

#### Import Patterns
- React hooks imported from 'react'
- Icons imported from 'lucide-react'
- Utility functions imported from relative paths
- Models imported from root `models.js`

### Architecture Patterns

#### Client-Server Architecture
- **Frontend**: React SPA served by Vite dev server on port 5173
- **Backend**: Express API server on port 3001
- **API Communication**: Fetch API for HTTP requests to backend endpoints

#### Frontend Structure
- **Routing**: React Router DOM for navigation between pages (/text-to-image, /image-to-image)
- **State Management**: React hooks (useState) for local component state
- **Layout**: Sidebar + main content area with collapsible model selector
- **Responsive Design**: Mobile-first with Tailwind CSS utility classes

#### API Endpoints
- `POST /api/generateImage` - Text-to-image generation
- `POST /api/imageToImage` - Image-to-image transformation (requires file upload)
- `POST /log` - Logs generation requests to log.txt file

#### Error Handling
- Server: Comprehensive error logging with timestamps
- Client: User-friendly error messages via alerts
- Provider compatibility: Detects and suggests alternative providers for incompatible models

### Testing Strategy
- No test framework is currently configured
- Manual testing via `npm run dev` for development
- Linting via `npm run lint` before commits recommended

### Git Workflow
- No explicit branching strategy documented
- `.gitignore` excludes: node_modules, dist, .env files
- Commit messages should follow conventional format (not strictly enforced)

## Domain Context

### Image Generation Workflow
1. User selects AI model from sidebar (filtered by task type)
2. User enters positive prompt and optional negative prompt
3. User selects image dimensions (preset or custom)
4. User selects inference provider (default: auto)
5. Frontend sends POST request to backend with parameters
6. Backend calls Hugging Face Inference API with selected model/provider
7. Backend returns image buffer to frontend
8. Frontend triggers browser download of generated image
9. Backend logs generation details (filename, prompt) to log.txt

### Model Categories
- Base models (FLUX, Stable Diffusion)
- LoRA adapters (style-specific, person-specific, art-style specific)
- Anime-style models
- Realistic portrait models
- Fantasy/artistic models

### Supported Tasks
- **Text-to-Image**: Generate images from text descriptions
- **Image-to-Image**: Transform/modify existing images with text prompts

### Inference Providers
Multiple providers supported via Hugging Face API: auto, cerebras, cohere, fal-ai, featherless-ai, fireworks-ai, groq, hf-inference, hyperbolic, nebius, novita, nscale, ovhcloud, publicai, replicate, sambanova, scaleway, together, wavespeed, zai-org

## Important Constraints

### Technical Constraints
- **Image dimensions**: Supported range 64-2048 pixels, step of 8
- **Rate limiting**: Hugging Face API has rate limits based on provider
- **Model availability**: Some models may be temporarily unavailable or provider-specific
- **File size limits**: Multer uses memory storage for file uploads
- **CORS**: Backend only accepts requests from localhost:5173

### Environment Requirements
- Node.js environment required for both dev server and backend
- Hugging Face API token required in .env file (VITE_HF_TOKEN)
- Both frontend (port 5173) and backend (port 3001) must run simultaneously
- Frontend expects backend at http://localhost:3001

### Performance Considerations
- Image generation can take several seconds to minutes
- Loading states shown during generation (penguin.gif animation)
- Larger image sizes and complex models increase generation time

## External Dependencies

### Hugging Face
- **Inference API**: Primary AI model provider
- **Model Hub**: Source of AI models used in the application
- **Authentication**: Requires API token for access

### File Storage
- **Downloads**: Browser's file-saver library for client-side downloads
- **Logging**: Local file system (log.txt) for tracking generations

### Icons
- **Lucide Icons**: Icon library for UI elements

### Deployment
- **Vercel**: Production deployment platform (https://text-2-img-vitejs.vercel.app)
