# Text to Image Conversion

## Description

This is a very simple application that uses AI to convert the prompts entered by the user into images. This will be the next feature of the Editia project.

### Stack

- HTML
- Tailwind CSS
- JavaScript
- React (Vite JS)
- Hugging Face
- Stable Diffusion
- Vercel

## Setup

First of all you must clone the repository:

```sh
git clone https://github.com/jezbravo/text-2-img-vitejs.git
cd text-2-img-vitejs
```

Then install the dependencies:

```node
npm install
```

### Environment Variables

In order for the program to work correctly, it is necessary to configure the following environment variables in an **.env** file at the root of the project:

```javascript
VITE_HF_TOKEN=
VITE_TXT_TO_IMG_MODEL=
```

The **VITE_HF_TOKEN** is provided by the Hugging Face service, and the **VITE_TXT_TO_IMG_MODEL** is the name of the selected model. You can freely experiment with many to evaluate the results.

## Additional settings

### Image Adjustment

You can improve the quality of the images by editing the **negative_prompt** of the App.jsx file as desired.

Once everything is ready:

```javascript
npm run dev
```

## Demo

Simply enter some text in the form field and press the "Generate" button. Wait a few seconds and your image will be ready.

You can test a deployed version at the following link: https://text-2-img-vitejs.vercel.app
