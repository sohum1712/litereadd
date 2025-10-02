# LiteRead - Complete Setup Guide

## Overview
LiteRead is a comprehensive AI-powered content analysis platform with full authentication, session management, and analysis history. It uses Google Gemini AI for content analysis and supports text, URL, and file inputs (PDF, DOCX).

## Features ✨
- **AI-Powered Analysis**: Uses Google Gemini AI for comprehensive content analysis
- **Authentication System**: Complete JWT-based auth with login/signup
- **Session Management**: Persistent user sessions with secure token handling
- **Analysis History**: Save and manage analysis history in MongoDB
- **Multiple Input Types**: Text, URL, and file analysis (PDF, DOCX)
- **Responsive UI**: Modern, glass-morphism design with dark/light themes
- **Security**: Password hashing, JWT tokens, input validation

## Quick Start 🚀

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run setup:server

# Install concurrently for running both servers
npm install -D concurrently
```

### 2. Environment Setup

Create a `.env` file in the project root:
```env
# Gemini AI API Key (REQUIRED)
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Backend API URL (default: http://localhost:3001/api)
VITE_API_BASE_URL=http://localhost:3001/api
```

Create a `.env` file in the `server/` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/literead

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### 3. Database Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB locally
# macOS with Homebrew:
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Windows: Download from https://www.mongodb.com/try/download/community
```

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in server/.env

### 4. Get Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Create a new API key
3. Copy the key to your `.env` file as `VITE_GEMINI_API_KEY`

### 5. Start the Application

```bash
# Start both frontend and backend
npm run dev:full

# OR start them separately:
# Terminal 1: Frontend (port 5173)
npm run dev

# Terminal 2: Backend (port 3001)
npm run server:dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Project Structure 📁

```
literead/
├── src/                          # Frontend source
│   ├── components/              # UI components
│   │   ├── ui/                 # Shadcn UI components
│   │   ├── Navigation.tsx      # Main navigation
│   │   ├── AnalysisResult.tsx  # Analysis display
│   │   └── Footer.tsx          # Footer component
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Application pages
│   │   ├── Home.tsx           # Main analysis page
│   │   ├── Library.tsx        # Analysis history
│   │   ├── Login.tsx          # Login page
│   │   ├── Signup.tsx         # Registration page
│   │   ├── Contact.tsx        # Contact page
│   │   └── NotFound.tsx       # 404 page
│   └── services/              # API services
│       ├── authService.ts     # Authentication API
│       ├── analysisService.ts # Analysis management
│       └── geminiService.ts   # Gemini AI integration
├── server/                     # Backend source
│   ├── config/                # Database config
│   ├── middleware/            # Auth middleware
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   └── server.js              # Express server
└── docs/                      # Documentation
```

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Analysis Management
- `GET /api/analysis` - Get user's analyses
- `POST /api/analysis` - Save new analysis
- `GET /api/analysis/:id` - Get specific analysis
- `PUT /api/analysis/:id` - Update analysis
- `DELETE /api/analysis/:id` - Delete analysis

## Features in Detail 🔧

### 1. Authentication System
- **JWT-based authentication** with secure token handling
- **Password hashing** using bcryptjs with salt rounds
- **Session persistence** in localStorage
- **Automatic token refresh** and logout on expiration
- **Protected routes** for authenticated features

### 2. AI Content Analysis
- **Google Gemini AI integration** for advanced analysis
- **Multiple input types**: Text, URL scraping, file upload
- **Comprehensive analysis**: Summary, keywords, insights
- **Markdown formatting** for readable results
- **Error handling** with user-friendly messages

### 3. File Processing
- **PDF extraction** using pdf.js
- **Word document processing** with mammoth.js
- **Text file support** with encoding detection
- **File size limits** and validation

### 4. URL Analysis
- **CORS proxy integration** for web scraping
- **Multiple fallback proxies** for reliability
- **HTML parsing** and text extraction
- **Content cleaning** and formatting

### 5. Database Design
- **User model**: Authentication and profile data
- **Analysis model**: Saved analysis with relationships
- **Indexing**: Optimized queries for performance
- **Validation**: Schema validation and constraints

## Security Features 🔒

- **Password hashing** with bcryptjs
- **JWT token authentication** with expiration
- **Input validation** and sanitization
- **CORS protection** with origin restrictions
- **Rate limiting** (can be added)
- **SQL injection prevention** (MongoDB)
- **XSS protection** with content security

## Troubleshooting 🔧

### Common Issues

1. **Gemini API Error**
   - Check API key in `.env` file
   - Verify API key is valid and has quota
   - Check internet connection

2. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in server/.env
   - Verify database permissions

3. **CORS Errors**
   - Check CLIENT_URL in server/.env
   - Verify frontend URL matches

4. **Port Already in Use**
   - Change ports in vite.config.ts (frontend)
   - Change PORT in server/.env (backend)

### Development Tips

- Use browser dev tools for debugging
- Check console for error messages
- Monitor network tab for API calls
- Use MongoDB Compass for database inspection

## Production Deployment 🚀

### Environment Variables
```env
# Production .env
NODE_ENV=production
JWT_SECRET=super-secure-random-string-64-chars-minimum
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/literead
CLIENT_URL=https://yourdomain.com
```

### Build Commands
```bash
# Build frontend
npm run build

# Start production server
npm run server
```

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Heroku, or VPS
- **Database**: MongoDB Atlas

## Contributing 🤝

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support 💬

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

**Built with ❤️ using React, TypeScript, Express, MongoDB, and Google Gemini AI**
