# Image-to-Video Generation Capability Spec

## ADDED Requirements

### Requirement: Image Upload and Preview
The system SHALL allow users to upload an image file and see a preview before generating video.

#### Scenario: User uploads valid image file
**Given** user is on Image-to-Video page
**When** they select a valid image file (JPG, PNG, etc.)
**Then** the image is displayed as a preview
**And** the file is stored in component state for generation

#### Scenario: User uploads invalid file
**Given** user is on Image-to-Video page
**When** they select an invalid file (e.g., PDF, TXT, or image > 10MB)
**Then** an error message is displayed
**And** no preview is shown
**And** the file is not accepted

### Requirement: Image-to-Video Model Selection
The system SHALL allow users to select from available Hugging Face image-to-video models.

#### Scenario: User selects model from sidebar
**Given** ModelSidebar is open and image-to-video models are loaded
**When** user clicks on a model in the sidebar
**Then** the model is selected
**And** the selected model name is displayed in the header
**And** the generate button becomes enabled (if image is selected)

#### Scenario: Model list filters by task type
**Given** ModelSidebar is in image-to-video mode
**When** the sidebar fetches models from Hugging Face Partners API
**Then** only models with pipeline_tag="image-to-video" are displayed
**And** models with other task types (text-to-image, etc.) are excluded

### Requirement: Provider Selection
The system SHALL allow users to select inference provider for video generation.

#### Scenario: User selects provider
**Given** user is on the Image-to-Video page
**When** they select a provider from the dropdown (e.g., fal-ai, auto)
**Then** the selection is saved in component state
**And** the selected provider will be used for video generation

#### Scenario: Default provider is set
**Given** user navigates to Image-to-Video page for the first time
**When** the page loads
**Then** fal-ai is selected as the default provider
**And** the dropdown shows fal-ai as the active selection

### Requirement: Video Generation
The system SHALL allow users to generate a video from their uploaded image.

#### Scenario: User generates video successfully
**Given** user has uploaded an image
**And** selected a compatible model and provider
**When** they click the "Generate Video" button
**Then** a loading state is displayed
**And** a request is sent to the backend API
**And** the backend calls the Hugging Face Inference API
**And** after processing, the video is returned to the frontend
**And** the browser automatically downloads the MP4 file

#### Scenario: Video generation with no image selected
**Given** user is on the Image-to-Video page
**When** they click "Generate Video" without selecting an image
**Then** an alert is displayed: "Please select an image first"
**And** no API call is made
**And** the page remains unchanged

#### Scenario: Video generation takes longer than expected
**Given** user has initiated video generation
**When** generation takes more than 60 seconds
**Then** a timeout error is displayed
**And** the loading state is cleared
**And** the user is informed of the delay

### Requirement: Error Handling
The system MUST handle and display errors clearly to users.

#### Scenario: Model incompatible with provider
**Given** user selects a model that doesn't support image-to-video on the chosen provider
**When** they attempt to generate a video
**Then** an error message is displayed: "The selected model provider does not support Image-to-Video at this time. Please try selecting a different model from the sidebar."
**And** the error includes details about the provider/model mismatch

#### Scenario: API rate limit exceeded
**Given** user is generating videos frequently
**When** the Hugging Face API returns a rate limit error
**Then** an error message is displayed: "Rate limit exceeded. Please wait a moment and try again."
**And** the user is informed of retry recommendations

#### Scenario: Model unavailable or loading error
**Given** the selected model is temporarily unavailable
**When** video generation is attempted
**Then** an error message is displayed explaining the issue
**And** the user is suggested to try a different model

### Requirement: Video File Handling
The system MUST ensure generated videos are properly formatted and downloadable.

#### Scenario: Video file naming
**Given** a video has been successfully generated
**When** the file is downloaded
**Then** the filename follows the pattern: `vid2vid_YYYY-MM-DD_HH-mm-ss_model-name.mp4`
**And** the date and time are from the moment of generation
**And** the model name replaces slashes with dashes

#### Scenario: Video file format
**Given** a video is returned from the API
**When** it is sent to the frontend
**Then** the Content-Type header is set to "video/mp4"
**And** the file is downloaded as an MP4 file
**And** the file can be played in standard video players

### Requirement: Generation Logging
The system MUST log all video generation requests for tracking and debugging.

#### Scenario: Log entry created on success
**Given** a video has been successfully generated
**When** the download completes
**Then** a log entry is appended to log.txt
**And** the log includes filename, model, and timestamp
**And** the log format matches existing entries

#### Scenario: Log entry includes error information
**Given** a video generation fails
**When** an error occurs on the server
**Then** detailed error information is logged to console
**And** the error includes model, provider, timestamp, and error message

### Requirement: User Interface Consistency
The Image-to-Video page SHALL follow the same UI patterns as existing pages.

#### Scenario: Sidebar navigation
**Given** user is on the Image-to-Video page
**When** they interact with the ModelSidebar
**Then** it behaves identically to TextToImage and ImageToImage pages
**And** the sidebar can be opened/closed
**And** models can be favorited/disliked
**And** search functionality works in the same way

#### Scenario: Navigation header
**Given** user is on the Image-to-Video page
**When** they view the header
**Then** it includes a "Home" button
**And** it includes a menu button to reopen sidebar (if closed)
**And** it shows the page title: "Image to Video"
**And** it displays the selected model name
**And** the styling matches other pages (emerald/green theme)

#### Scenario: Toast notifications
**Given** user performs an action (e.g., copies prompt)
**When** a toast appears
**Then** it uses the same animation and positioning as other pages
**And** it automatically dismisses after 2 seconds
**And** the icon and message are consistent

### Requirement: Loading States
The system SHALL provide clear feedback to users during video generation.

#### Scenario: Loading animation displayed
**Given** user clicks "Generate Video"
**When** the API call is in progress
**Then** the penguin.gif animation is displayed
**And** the button shows "Generating Video..."
**And** the button is disabled
**And** the upload area is disabled

#### Scenario: Loading state cleared on completion
**Given** video generation completes (success or error)
**When** the response is received
**Then** the loading animation is hidden
**And** the button text returns to "Generate Video"
**And** the button is re-enabled (if appropriate)

### Requirement: Responsive Design
The Image-to-Video page MUST work on different screen sizes.

#### Scenario: Mobile view
**Given** user is on a mobile device
**When** they navigate to the Image-to-Video page
**Then** the sidebar is collapsed by default
**And** the form fits within the viewport
**And** the image upload area is touch-friendly
**And** the button is large enough to tap easily

#### Scenario: Desktop view
**Given** user is on a desktop device
**When** they navigate to the Image-to-Video page
**Then** the sidebar is visible by default
**And** the layout uses the available space efficiently
**And** the form is centered and readable