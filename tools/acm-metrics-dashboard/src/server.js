/* Copyright Contributors to the Open Cluster Management project */

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { MetricsCollector } from './metrics-collector.js'
import { VelocityCalculator } from './velocity-calculator.js'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.METRICS_PORT || 3001

// Initialize services
const metricsCollector = new MetricsCollector()
const velocityCalculator = new VelocityCalculator()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Dashboard home
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

// API Routes

// Get current team velocity metrics
app.get('/api/velocity', async (req, res) => {
  try {
    const period = req.query.period || 'month' // week, month, quarter
    const metrics = await velocityCalculator.getVelocityMetrics(period)
    res.json(metrics)
  } catch (error) {
    console.error('Error fetching velocity metrics:', error)
    res.status(500).json({ error: 'Failed to fetch velocity metrics' })
  }
})

// Get feature completion metrics
app.get('/api/features', async (req, res) => {
  try {
    const period = req.query.period || 'month'
    const features = await metricsCollector.getFeatureMetrics(period)
    res.json(features)
  } catch (error) {
    console.error('Error fetching feature metrics:', error)
    res.status(500).json({ error: 'Failed to fetch feature metrics' })
  }
})

// Get bug resolution metrics
app.get('/api/bugs', async (req, res) => {
  try {
    const period = req.query.period || 'month'
    const bugs = await metricsCollector.getBugMetrics(period)
    res.json(bugs)
  } catch (error) {
    console.error('Error fetching bug metrics:', error)
    res.status(500).json({ error: 'Failed to fetch bug metrics' })
  }
})

// Get pull request metrics
app.get('/api/pull-requests', async (req, res) => {
  try {
    const period = req.query.period || 'month'
    const prs = await metricsCollector.getPullRequestMetrics(period)
    res.json(prs)
  } catch (error) {
    console.error('Error fetching PR metrics:', error)
    res.status(500).json({ error: 'Failed to fetch PR metrics' })
  }
})

// Get code quality metrics
app.get('/api/code-quality', async (req, res) => {
  try {
    const period = req.query.period || 'month'
    const quality = await metricsCollector.getCodeQualityMetrics(period)
    res.json(quality)
  } catch (error) {
    console.error('Error fetching code quality metrics:', error)
    res.status(500).json({ error: 'Failed to fetch code quality metrics' })
  }
})

// Get team performance summary
app.get('/api/summary', async (req, res) => {
  try {
    const period = req.query.period || 'month'
    const summary = await velocityCalculator.getTeamSummary(period)
    res.json(summary)
  } catch (error) {
    console.error('Error fetching team summary:', error)
    res.status(500).json({ error: 'Failed to fetch team summary' })
  }
})

// Get historical trends
app.get('/api/trends', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6
    const trends = await velocityCalculator.getHistoricalTrends(months)
    res.json(trends)
  } catch (error) {
    console.error('Error fetching trends:', error)
    res.status(500).json({ error: 'Failed to fetch trends' })
  }
})

// Manual data refresh
app.post('/api/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual refresh triggered...')
    await metricsCollector.collectAllMetrics()
    res.json({ 
      success: true, 
      message: 'Metrics refreshed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error refreshing metrics:', error)
    res.status(500).json({ error: 'Failed to refresh metrics' })
  }
})

// Export metrics data
app.get('/api/export', async (req, res) => {
  try {
    const format = req.query.format || 'json' // json, csv
    const period = req.query.period || 'month'
    const data = await metricsCollector.exportMetrics(period, format)
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="acm-metrics-${period}.csv"`)
    }
    
    res.send(data)
  } catch (error) {
    console.error('Error exporting metrics:', error)
    res.status(500).json({ error: 'Failed to export metrics' })
  }
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Dashboard Error:', err)
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found', 
    path: req.path, 
    method: req.method 
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`📊 ACM Metrics Dashboard running on http://localhost:${PORT}`)
  console.log(`🔍 API endpoints:`)
  console.log(`   - GET /api/velocity - Team velocity metrics`)
  console.log(`   - GET /api/features - Feature completion metrics`)
  console.log(`   - GET /api/bugs - Bug resolution metrics`)
  console.log(`   - GET /api/pull-requests - PR metrics`)
  console.log(`   - GET /api/code-quality - Code quality metrics`)
  console.log(`   - GET /api/summary - Team performance summary`)
  console.log(`   - GET /api/trends - Historical trends`)
  console.log(`   - POST /api/refresh - Manual data refresh`)
  console.log(`   - GET /api/export - Export metrics data`)
  console.log(`\n🚀 Dashboard UI: http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📊 Shutting down metrics dashboard...')
  process.exit(0)
})
