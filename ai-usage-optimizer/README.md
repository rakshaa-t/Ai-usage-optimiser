# AI Usage Optimizer

A beautiful, modern web application to analyze and optimize your AI API spending. Upload your usage data and discover opportunities to reduce costs while maintaining performance.

![AI Usage Optimizer](https://img.shields.io/badge/React-18.3-blue?logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff69b4)

## ✨ Features

- **Drag & Drop Upload** - Seamlessly upload CSV files with beautiful 3D tilt interactions
- **Real-time Analysis** - Process your API usage data with stunning loading animations
- **Interactive Dashboard** - Visualize spending with animated pie charts and bar graphs
- **Smart Recommendations** - Get AI-powered suggestions to optimize your costs
- **Premium UI/UX** - Metallic shine effects, glass morphism, and butter-smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rakshaa-t/Ai-usage-optimiser.git
cd Ai-usage-optimiser

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
ai-usage-optimizer/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── BackgroundEffects.jsx  # Animated background orbs & patterns
│   │   ├── TiltCard.jsx           # 3D tilt card with metallic shine
│   │   ├── PieChart.jsx           # Interactive donut chart
│   │   └── UsageChart.jsx         # Animated bar chart
│   ├── pages/
│   │   ├── UploadPage.jsx         # File upload with drag & drop
│   │   ├── AnalyzingPage.jsx      # Processing animation
│   │   └── DashboardPage.jsx      # Analytics dashboard
│   ├── styles/
│   │   └── index.css              # Global styles & utilities
│   ├── App.jsx                    # Main app with routing
│   └── main.jsx                   # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎨 Design Features

### Visual Effects
- **3D Tilt Cards** - GPU-accelerated transforms with perspective
- **Metallic Shine** - Dynamic light reflection following cursor
- **Glass Morphism** - Frosted glass effect with backdrop blur
- **Gradient Glow** - Animated color-shifting shadows
- **Particle Effects** - Floating ambient particles

### Animations
- **Page Transitions** - Smooth fade and slide transitions
- **Staggered Reveals** - Sequential element animations
- **Spring Physics** - Natural feeling interactions
- **Hover Effects** - Scale, glow, and color transitions

## 🛠 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Papa Parse** - CSV parsing
- **Lucide React** - Icons

## 📊 CSV Format

Upload a CSV file with your AI API usage data. Supported formats:

```csv
date,model,requests,tokens,cost
2024-01-01,gpt-4,150,50000,12.50
2024-01-01,gpt-3.5-turbo,300,100000,5.00
2024-01-02,claude-3,200,75000,8.25
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Drag & drop the `dist` folder to Netlify
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

Built with 💜 by [Rakshaa](https://github.com/rakshaa-t)
