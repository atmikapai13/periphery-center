# Project Structure

## Folder Organization

```
periphery-center/
├── public/              # Static assets
│   └── icons.svg
├── src/
│   ├── assets/         # Images, fonts, and other media files
│   ├── components/     # Reusable React components
│   │   └── ExampleComponent.jsx
│   ├── pages/          # Page-level components
│   │   └── HomePage.jsx
│   ├── hooks/          # Custom React hooks
│   │   └── useExample.js
│   ├── utils/          # Utility functions and helpers
│   │   └── helpers.js
│   ├── services/       # API calls and external services
│   │   └── api.js
│   ├── context/        # React Context providers
│   │   └── AppContext.jsx
│   ├── styles/         # CSS/SCSS files
│   │   ├── App.css
│   │   └── index.css
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Application entry point
├── .gitignore
├── index.html          # HTML template
├── package.json
├── vite.config.js      # Vite configuration
└── eslint.config.js    # ESLint configuration
```

## Directory Purposes

- **components/**: Reusable UI components used across multiple pages
- **pages/**: Top-level page components, typically mapped to routes
- **hooks/**: Custom React hooks for shared logic
- **utils/**: Pure JavaScript utility functions
- **services/**: API calls and external service integrations
- **context/**: React Context for global state management
- **styles/**: CSS files and styling
- **assets/**: Static files like images, fonts, icons

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
