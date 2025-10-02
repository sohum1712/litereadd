# LiteRead - AI-Powered Text Analysis Tool

LiteRead is a modern, AI-powered text analysis and summarization application that helps you read smarter, not harder. Built with React, TypeScript, and Google's Gemini AI, it provides comprehensive analysis of text content from various sources.

## 🚀 Features

- **Multi-Input Support**: Analyze text from direct input, URLs, or file uploads
- **AI-Powered Analysis**: Leverages Google Gemini AI for intelligent text processing
- **Markdown Output**: Get beautifully formatted analysis results in markdown
- **Keyword Extraction**: Automatically identifies key terms and concepts
- **Local Storage**: Save and manage your analysis history
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Modern UI**: Clean, professional interface with glassmorphism design

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: Google Generative AI (Gemini)
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v16 or higher)
- npm or yarn package manager
- Google Gemini API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd literead
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 Getting a Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AnalysisResult.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── pages/              # Page components
│   ├── Home.tsx
│   ├── Library.tsx
│   ├── Contact.tsx
│   └── ...
├── services/           # API and business logic
│   └── geminiService.ts
├── lib/                # Utility functions
│   └── utils.ts
└── hooks/              # Custom React hooks
    └── ...
```

## 🎯 Usage

### Text Analysis
1. Navigate to the home page
2. Choose your input method:
   - **Text**: Paste content directly
   - **File**: Upload text files (.txt, .md, .csv, .json)
   - **URL**: Enter a webpage URL
3. Click "Analyze" to process the content
4. View the comprehensive markdown analysis
5. Save results to your library for future reference

### Managing Your Library
- Access saved analyses from the Library page
- Search through your saved content
- Delete analyses you no longer need
- Export analyses as markdown files

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment Variables for Production
Make sure to set the `VITE_GEMINI_API_KEY` environment variable in your production environment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful text analysis capabilities
- shadcn/ui for beautiful UI components
- The React and TypeScript communities for excellent tooling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Made with ❤️ for better reading experiences**