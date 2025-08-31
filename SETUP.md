# EchoGauge Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Convex Configuration
   NEXT_PUBLIC_CONVEX_URL=your_convex_url_here

   # Gemini AI Configuration
   # Get your API key from: https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_HAS_GEMINI=true

   # Clerk Authentication (if using)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   ```

3. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env.local` file

4. **Run the Application**
   ```bash
   npm run dev
   ```

## Features

### Enhanced PDF Parsing
- Fixed pdfjs-dist import issues
- Improved text extraction quality
- Better error handling and fallbacks

### AI-Powered Analysis
- Gemini API integration for comprehensive content analysis
- Automatic summary generation
- Key topic extraction
- Tone analysis
- Reading time estimation
- Actionable improvement suggestions

### Improved UI/UX
- Clean, modern dashboard layout
- Better organized components
- Enhanced visual hierarchy
- Responsive design
- Smooth animations and transitions

### Content Analysis
- PDF and image upload support
- OCR for image text extraction
- Real-time analysis progress
- Export to Markdown and PDF
- Historical analysis tracking

## Troubleshooting

### PDF Parsing Issues
If you encounter PDF parsing errors:
1. Ensure pdfjs-dist is properly installed: `npm install pdfjs-dist@4.8.69`
2. Check that the PDF file is not corrupted
3. Try with a different PDF file

### Gemini API Issues
If Gemini analysis fails:
1. Verify your API key is correct
2. Check your API quota and billing
3. Ensure the API key has proper permissions
4. The app will fall back to local analysis if Gemini fails

### Performance Issues
- Large files (>10MB) may take longer to process
- Consider breaking large documents into smaller sections
- Ensure stable internet connection for API calls

## Development

### Project Structure
```
echogauge/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── session/           # Analysis session pages
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── convex/               # Convex backend
│   ├── _generated/       # Generated types
│   └── ...               # Backend functions
└── lib/                  # Utility functions
```

### Key Components
- `DashboardClient`: Main dashboard interface
- `FileDropCard`: File upload component
- `SessionClient`: Analysis results display
- `GeminiWarning`: API key status indicator

### Adding New Features
1. Create components in the `components/` directory
2. Add backend functions in `convex/`
3. Update the schema if needed
4. Add environment variables for new services

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the console logs for error details
3. Ensure all environment variables are properly set
4. Verify your API keys and quotas
