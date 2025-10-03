# AI Landscape Designer

> Transform your outdoor spaces with AI-powered landscape redesign

An intelligent landscape design application that uses Google's Gemini 2.5 Flash Image model to reimagine and redesign outdoor spaces. Upload a photo of your yard or garden, select your preferred style, and watch as AI creates a beautiful landscape design tailored to your vision.

## Features

- 🎨 **12 Landscaping Styles** - Modern, Minimalist, Rustic, Mediterranean, Japanese Garden, Tropical, Farmhouse, Coastal, Desert, Urban Modern, Bohemian, and English Cottage
- 🤖 **AI-Powered Redesign** - Powered by Google Gemini 2.5 Flash Image model
- 🌿 **Smart Plant Selection** - Climate-appropriate plants and features for your region
- ✏️ **Customization Tools** - Refine designs with additions, replacements, and deletions
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 💾 **Project History** - Save and manage up to 7 pinned designs
- ♿ **Accessible** - Full keyboard navigation and screen reader support
- 🎯 **No Structural Changes Mode** - Option to modify only plants and softscapes

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6.x
- **Styling**: Tailwind CSS v3.4.1 (local build)
- **AI Service**: Google Gemini 2.5 Flash Image via `@google/genai`
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage + IndexedDB

## Prerequisites

- **Node.js**: v16.x or higher
- **npm**: v7.x or higher
- **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/apikey)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MongiLearnsToCode/ai-landscapedesigner.git
cd ai-landscapedesigner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

**Where to get your API key:**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste it into `.env.local`

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000/`

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
ai-landscapedesigner/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ImageUploader.tsx
│   ├── StyleSelector.tsx
│   ├── ResultDisplay.tsx
│   ├── HistoryCard.tsx
│   └── ...
├── pages/              # Page components
│   ├── DesignerPage.tsx
│   ├── HistoryPage.tsx
│   ├── PricingPage.tsx
│   └── ...
├── contexts/           # React Context providers
│   ├── AppContext.tsx
│   ├── HistoryContext.tsx
│   └── ToastContext.tsx
├── services/           # API and data services
│   ├── geminiService.ts
│   ├── historyService.ts
│   └── imageDB.ts
├── hooks/              # Custom React hooks
├── types.ts            # TypeScript type definitions
├── constants.ts        # App constants
├── styles.css          # Global styles with Tailwind
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## Usage Guide

### Basic Workflow

1. **Upload Image**: Click the upload area or drag and drop an image of your outdoor space
2. **Select Style**: Choose one or two landscaping styles to blend
3. **Configure Options**:
   - Allow structural changes (walls, gates, hardscapes)
   - Select climate zone for appropriate plants
   - Choose design density (minimal, balanced, or lush)
4. **Generate**: Click "Generate Redesign" and wait for AI to create your design
5. **Customize**: Use the Customize button to add, replace, or remove specific elements
6. **Save**: Designs are automatically saved to your history

### Advanced Features

#### Climate-Appropriate Plants
When you specify a climate zone, the AI selects plants that thrive in that environment. For arid climates, it prioritizes drought-tolerant species like succulents, cacti, and hardy shrubs.

#### Design Density Control
- **Minimal**: Open space with limited high-impact plantings
- **Balanced**: Harmonious mix of planted areas and functional space
- **Lush**: Dense, layered garden with maximum vegetation

#### Project Management
- Pin up to 7 favorite designs for permanent storage
- Unpinned designs are automatically deleted after 7 days
- View project history with thumbnail previews
- Load previous designs back into the editor

## Architecture

For detailed information about the app's architecture, see [WARP.md](./WARP.md).

Key architectural patterns:
- **Context-based state management** for global app state
- **Dual storage strategy** (localStorage for metadata, IndexedDB for images)
- **Multi-modal AI integration** with Gemini 2.5 Flash Image

## Recent Changes

This project recently migrated from Tailwind CSS CDN to a local Tailwind v3 build. See [tailwindcdn-migration.md](./tailwindcdn-migration.md) for the complete migration guide.

### Key Improvements:
- ✅ 98% smaller CSS bundle (45KB vs 3.5MB)
- ✅ Enhanced keyboard accessibility
- ✅ Better icon rendering
- ✅ Production-ready build pipeline
- ✅ Offline development support

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Issue**: No styles showing
- **Solution**: Hard refresh browser (Ctrl+Shift+R) and clear Vite cache: `rm -rf node_modules/.vite`

**Issue**: Icons not rendering
- **Solution**: Ensure `lucide-react` is installed: `npm install lucide-react`

**Issue**: API errors
- **Solution**: Verify your `GEMINI_API_KEY` is set correctly in `.env.local`

**Issue**: Hover overlays not appearing
- **Solution**: Ensure you're using Tailwind v3.4.1: `npm list tailwindcss`

For more troubleshooting, see [tailwindcdn-migration.md](./tailwindcdn-migration.md#troubleshooting).

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Powered by [Google Gemini](https://ai.google.dev/) AI
- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## Links

- **GitHub Repository**: [MongiLearnsToCode/ai-landscapedesigner](https://github.com/MongiLearnsToCode/ai-landscapedesigner)
- **AI Studio**: [View in AI Studio](https://ai.studio/apps/drive/1rfjqLceVuySgBwiJ_UKNZ-XmGokOukSH)
- **Documentation**: See [WARP.md](./WARP.md) and [tailwindcdn-migration.md](./tailwindcdn-migration.md)

---

**Made with 🌿 by [Dlamini Mongi](https://github.com/MongiLearnsToCode)**
