#!/usr/bin/env node

/* Copyright Contributors to the Open Cluster Management project */

/**
 * ACM Metrics Collection Script
 * Collects team velocity and development metrics from GitHub
 */

import { MetricsCollector } from '../src/metrics-collector.js'
import cron from 'node-cron'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

const collector = new MetricsCollector()

async function collectMetrics() {
    console.log(`\n📊 ${new Date().toISOString()} - Starting metrics collection...`)
    
    try {
        await collector.collectAllMetrics()
        console.log('✅ Metrics collection completed successfully')
        
        // Generate quick summary
        const summary = await generateSummary()
        console.log('\n📈 Quick Summary:')
        console.log(summary)
        
    } catch (error) {
        console.error('❌ Metrics collection failed:', error.message)
        process.exit(1)
    }
}

async function generateSummary() {
    try {
        const [features, bugs, prs] = await Promise.all([
            collector.getFeatureMetrics('month'),
            collector.getBugMetrics('month'),
            collector.getPullRequestMetrics('month')
        ])
        
        return `
  🎯 Features: ${features.completed}/${features.total} completed (${features.completionRate}%)
  🐛 Bugs: ${bugs.resolved}/${bugs.total} resolved (${bugs.resolutionRate}%)
  🔀 PRs: ${prs.merged}/${prs.total} merged (${prs.mergeRate}%)
  ⏱️  Avg Bug Resolution: ${bugs.avgResolutionTime} days
  ⏱️  Avg PR Review: ${prs.avgReviewTime} hours
        `.trim()
        
    } catch (error) {
        return `❌ Failed to generate summary: ${error.message}`
    }
}

function setupScheduledCollection() {
    console.log('⏰ Setting up scheduled metrics collection...')
    
    // Collect metrics every 4 hours
    cron.schedule('0 */4 * * *', async () => {
        console.log('🔄 Scheduled metrics collection triggered')
        await collectMetrics()
    })
    
    // Daily summary at 9 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('📊 Daily summary triggered')
        const summary = await generateSummary()
        console.log('\n📈 Daily Team Metrics Summary:')
        console.log(summary)
    })
    
    console.log('✅ Scheduled jobs configured:')
    console.log('  - Metrics collection: Every 4 hours')
    console.log('  - Daily summary: 9:00 AM')
}

// Main execution
async function main() {
    const args = process.argv.slice(2)
    const period = args.find(arg => arg.startsWith('--period='))?.split('=')[1] || 'month'
    const scheduled = args.includes('--scheduled')
    const daemon = args.includes('--daemon')
    
    // Check for required environment variables
    if (!process.env.GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN environment variable is required')
        console.log('💡 Get a token from: https://github.com/settings/tokens')
        console.log('💡 Required permissions: repo, read:user')
        process.exit(1)
    }
    
    if (daemon) {
        console.log('🚀 Starting ACM Metrics Collector in daemon mode...')
        setupScheduledCollection()
        
        // Keep process alive
        setInterval(() => {
            // Send heartbeat every 30 minutes
            console.log(`💓 Heartbeat: ${new Date().toISOString()}`)
        }, 30 * 60 * 1000)
        
        // Initial collection
        await collectMetrics()
        
    } else if (scheduled) {
        setupScheduledCollection()
        console.log('⏰ Scheduled collection configured. Process will exit.')
        
    } else {
        // One-time collection
        await collectMetrics()
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
    process.exit(0)
})

process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...')
    process.exit(0)
})

// Run if called directly
if (process.argv[1].endsWith('collect-metrics.js')) {
    main().catch(error => {
        console.error('💥 Fatal error:', error)
        process.exit(1)
    })
}
