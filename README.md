# EchoGauge - AI-Powered Content Analysis

A modern web application for analyzing PDFs, images, and documents using AI-powered insights. Built with Next.js, Convex, and Google's Gemini AI.

## ✨ Features

### 🚀 Enhanced Content Analysis
- **PDF Parsing**: Robust PDF text extraction with improved quality
- **Image OCR**: Extract text from images using Tesseract.js
- **AI Analysis**: Comprehensive content analysis powered by Gemini AI
- **Real-time Processing**: Live progress tracking for uploads and analysis

### 🤖 AI-Powered Insights
- **Automatic Summaries**: AI-generated content summaries
- **Key Topic Extraction**: Identify main themes and topics
- **Tone Analysis**: Detect content tone and style
- **Readability Scoring**: Assess content complexity
- **Reading Time Estimation**: Calculate estimated reading duration
- **Actionable Suggestions**: Get improvement recommendations

### 🎨 Modern UI/UX
- **Clean Dashboard**: Organized, clutter-free interface
- **Responsive Design**: Works seamlessly on all devices
- **Smooth Animations**: Polished user interactions
- **Visual Hierarchy**: Clear information organization
- **Export Options**: Download results as Markdown or PDF

### 📊 Analytics & Tracking
- **Historical Analysis**: Track all your content analyses
- **Progress Monitoring**: Real-time upload and processing status
- **Usage Statistics**: Monitor your analysis activity
- **Session Management**: Organize and review past analyses

## 🛠️ Quick Start

### 1. Setup Environment
```bash
# Run the interactive setup wizard
npm run setup

# Or manually create .env.local with:
NEXT_PUBLIC_CONVEX_URL=your_convex_url
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_HAS_GEMINI=true
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_HAS_GEMINI=true

# Optional
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_APP_NAME=EchoGauge
```

### Supported File Types
- **PDFs**: Up to 10MB
- **Images**: PNG, JPG, JPEG, WebP (up to 10MB)
- **Text**: Direct text input for quick analysis

## 🏗️ Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Beautiful icon set

### Backend
- **Convex**: Real-time database and backend functions
- **PDF.js**: Client-side PDF parsing
- **Tesseract.js**: OCR for image text extraction

### AI Integration
- **Google Gemini**: Advanced content analysis
- **Fallback Analysis**: Local processing when AI unavailable
- **Error Handling**: Graceful degradation

## 📁 Project Structure

```
echogauge/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (PDF parsing, OCR)
│   ├── dashboard/         # Main dashboard
│   └── session/           # Analysis results
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── convex/               # Backend functions
│   ├── _generated/       # Generated types
│   ├── analyze.ts        # AI analysis logic
│   ├── extract.ts        # Content extraction
│   └── schema.ts         # Database schema
├── lib/                  # Utility functions
└── scripts/              # Setup and utility scripts
```

## 🚀 Recent Improvements

### Fixed Issues
- ✅ **PDF.js Import Errors**: Resolved module resolution issues
- ✅ **Worker Configuration**: Fixed server-side PDF parsing
- ✅ **Text Quality**: Improved extracted content formatting
- ✅ **Error Handling**: Better fallback mechanisms

### Enhanced Features
- 🎨 **UI Organization**: Cleaner, less cluttered interface
- 🤖 **Gemini Integration**: More comprehensive AI analysis
- 📊 **Better Analytics**: Enhanced metrics and insights
- 🎯 **Improved UX**: Better user flow and feedback

### New Capabilities
- 📝 **Enhanced Analysis**: Summary, topics, tone, reading time
- 🎨 **Modern Design**: Gradient backgrounds, better spacing
- 📱 **Responsive Layout**: Optimized for all screen sizes
- ⚡ **Performance**: Faster processing and better caching

## 🐛 Troubleshooting

### Common Issues

**PDF Parsing Errors**
```bash
# Ensure correct pdfjs-dist version
npm install pdfjs-dist@4.8.69
```

**Gemini API Issues**
- Verify API key is correct
- Check API quota and billing
- App falls back to local analysis if AI fails

**Performance Issues**
- Large files (>10MB) may take longer
- Ensure stable internet connection
- Consider breaking large documents

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run format       # Format code
npm run setup        # Interactive setup wizard
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For help and questions:
1. Check the [SETUP.md](./SETUP.md) guide
2. Review the troubleshooting section
3. Check console logs for error details
4. Ensure all environment variables are set correctly

---

Built with ❤️ using Next.js, Convex, and Google Gemini AI
