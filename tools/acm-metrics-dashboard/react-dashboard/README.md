# 📊 ACM Team Metrics Dashboard - React Version

A modern React + TypeScript version of the ACM team velocity and development metrics dashboard.

## 🚀 Features

- **React 18** with TypeScript for type safety
- **React Query** for efficient data fetching and caching
- **Chart.js** with React integration for beautiful visualizations
- **Responsive design** that works on all devices
- **Real-time data** with automatic refresh
- **Error boundaries** for graceful error handling
- **Loading states** and skeleton screens

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite (fast development and builds)
- **Data Fetching**: TanStack React Query
- **Charts**: Chart.js + react-chartjs-2
- **Styling**: CSS with modern features
- **Date Handling**: date-fns

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- The ACM Metrics API server running on port 3001

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Opens on http://localhost:3002

### Production Build
```bash
npm run build
npm run preview
```

## 📡 API Integration

The React app connects to the existing Node.js API server:
- **API Server**: http://localhost:3001
- **React App**: http://localhost:3002
- **Proxy**: Vite dev server proxies `/api` and `/health` to port 3001

## 🎨 Components Architecture

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard container
│   ├── Header.tsx             # App header
│   ├── Controls.tsx           # Period selector & buttons
│   ├── MetricsGrid.tsx        # Grid of metric cards
│   ├── MetricCard.tsx         # Individual metric display
│   ├── VelocityScoreCard.tsx  # Special score card
│   ├── Tooltip.tsx            # Reusable tooltip
│   ├── ChartsSection.tsx      # Charts container
│   ├── Recommendations.tsx    # Action recommendations
│   ├── LoadingSpinner.tsx     # Loading state
│   ├── ErrorMessage.tsx       # Error display
│   ├── ErrorBoundary.tsx      # Error boundary
│   └── charts/
│       ├── TrendsChart.tsx    # Historical trends line chart
│       ├── ContributionsChart.tsx # Team contributions bar chart
│       └── BreakdownChart.tsx # Work breakdown doughnut chart
├── services/
│   └── api.ts                 # API service layer
├── types/
│   └── metrics.ts             # TypeScript interfaces
├── App.tsx                    # Root app component
└── main.tsx                   # React entry point
```

## 📊 Key Features

### **Smart Data Management**
- Automatic caching with React Query
- Background refetch every 4 hours
- Manual refresh capability
- Optimistic updates

### **Interactive Charts**
- Historical trends with multiple datasets
- Team contribution comparisons
- Work breakdown visualization
- Hover tooltips and legends

### **Responsive Design**
- Mobile-first approach
- Flexible grid layout
- Touch-friendly interactions
- Optimized for all screen sizes

### **Error Handling**
- React Error Boundaries
- API error recovery
- Retry mechanisms
- User-friendly error messages

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:3001
```

### Proxy Configuration
Update `vite.config.ts` to change API server location:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://your-api-server:port',
      changeOrigin: true
    }
  }
}
```

## 🎯 Benefits Over Vanilla Version

### **Developer Experience**
- ✅ TypeScript for better IDE support and fewer bugs
- ✅ Hot module replacement for instant updates
- ✅ Component-based architecture for maintainability
- ✅ Modern React patterns and hooks

### **User Experience**
- ✅ Faster initial load with code splitting
- ✅ Better loading states and error handling
- ✅ Smooth animations and transitions
- ✅ Improved accessibility

### **Performance**
- ✅ Virtual DOM optimizations
- ✅ Intelligent caching with React Query
- ✅ Bundle optimization with Vite
- ✅ Lazy loading capabilities

## 🧪 Development

### Adding New Metrics
1. Update `types/metrics.ts` with new interfaces
2. Add API endpoints in `services/api.ts`
3. Create new components in `components/`
4. Integrate into `Dashboard.tsx`

### Adding New Charts
1. Create component in `components/charts/`
2. Register Chart.js components needed
3. Add to `ChartsSection.tsx`

### Styling
- Modify `App.css` for global styles
- Use CSS modules for component-specific styles
- Follow existing design system patterns

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy with Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3002
CMD ["npm", "run", "preview"]
```

### Deploy to Vercel/Netlify
The built `dist/` folder can be deployed to any static hosting service.

## 🔄 Migration from Vanilla Version

The React version maintains 100% API compatibility:
- Same backend server (no changes needed)
- Same data structures and endpoints
- Same visual design and functionality
- Enhanced with React benefits

## 🤝 Contributing

1. Follow React and TypeScript best practices
2. Use functional components with hooks
3. Add proper TypeScript types
4. Include error handling
5. Write responsive CSS

---

**Built with ❤️ for the ACM team**