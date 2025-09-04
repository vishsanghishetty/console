#!/usr/bin/env node

/* Copyright Contributors to the Open Cluster Management project */

/**
 * Setup script for ACM Metrics Dashboard
 * Validates configuration and sets up initial data
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { MetricsCollector } from '../src/metrics-collector.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class DashboardSetup {
    constructor() {
        this.configPath = path.join(__dirname, '../.env')
    }
    
    async run() {
        console.log('🚀 Setting up ACM Metrics Dashboard...\n')
        
        try {
            await this.checkPrerequisites()
            await this.validateGitHubAccess()
            await this.collectInitialData()
            await this.createConfigFile()
            this.showCompletionMessage()
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message)
            process.exit(1)
        }
    }
    
    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...')
        
        // Check Node.js version
        const nodeVersion = process.version
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
        
        if (majorVersion < 16) {
            throw new Error(`Node.js 16+ required, found ${nodeVersion}`)
        }
        
        console.log(`✅ Node.js version: ${nodeVersion}`)
        
        // Check GitHub token
        if (!process.env.GITHUB_TOKEN) {
            console.log('\n⚠️  GitHub token not found in environment')
            console.log('📝 Please set GITHUB_TOKEN environment variable:')
            console.log('   export GITHUB_TOKEN=your_github_token_here')
            console.log('\n💡 Get a token from: https://github.com/settings/tokens')
            console.log('💡 Required permissions: repo, read:user, read:org')
            throw new Error('GITHUB_TOKEN environment variable required')
        }
        
        console.log('✅ GitHub token found')
    }
    
    async validateGitHubAccess() {
        console.log('\n🔗 Validating GitHub access...')
        
        const collector = new MetricsCollector()
        
        try {
            // Test GitHub API access
            const issues = await collector.fetchIssues()
            console.log(`✅ GitHub API access verified (${issues.length} issues found)`)
            
            const prs = await collector.fetchPullRequests()
            console.log(`✅ Pull request access verified (${prs.length} PRs found)`)
            
            const commits = await collector.fetchCommits()
            console.log(`✅ Commit access verified (${commits.length} recent commits found)`)
            
        } catch (error) {
            console.error('❌ GitHub API access failed:', error.message)
            
            if (error.message.includes('401')) {
                console.log('\n💡 Possible solutions:')
                console.log('  - Verify your GitHub token is correct')
                console.log('  - Check token permissions (repo, read:user, read:org)')
                console.log('  - Ensure token hasn\'t expired')
            }
            
            throw error
        }
    }
    
    async collectInitialData() {
        console.log('\n📊 Collecting initial metrics data...')
        
        const collector = new MetricsCollector()
        
        try {
            await collector.collectAllMetrics()
            console.log('✅ Initial data collection completed')
            
            // Generate sample summary
            const [features, bugs, prs] = await Promise.all([
                collector.getFeatureMetrics('month'),
                collector.getBugMetrics('month'),
                collector.getPullRequestMetrics('month')
            ])
            
            console.log('\n📈 Sample metrics:')
            console.log(`  🎯 Features: ${features.completed}/${features.total} completed`)
            console.log(`  🐛 Bugs: ${bugs.resolved}/${bugs.total} resolved`)
            console.log(`  🔀 PRs: ${prs.merged}/${prs.total} merged`)
            
        } catch (error) {
            console.warn('⚠️  Initial data collection failed:', error.message)
            console.log('💡 This is not critical - data will be collected when the server starts')
        }
    }
    
    async createConfigFile() {
        console.log('\n⚙️  Creating configuration file...')
        
        const config = `# ACM Metrics Dashboard Configuration
# Generated on ${new Date().toISOString()}

# GitHub Configuration
GITHUB_TOKEN=${process.env.GITHUB_TOKEN}

# Server Configuration
METRICS_PORT=3001

# Collection Schedule (cron format)
COLLECTION_SCHEDULE=0 */4 * * *
SUMMARY_SCHEDULE=0 9 * * *

# Dashboard Settings
DEFAULT_PERIOD=month
MAX_CONTRIBUTORS=10
HEALTH_SCORE_THRESHOLD=80

# Data Retention (days)
DATA_RETENTION_DAYS=90
`
        
        writeFileSync(this.configPath, config)
        console.log(`✅ Configuration saved to ${this.configPath}`)
    }
    
    showCompletionMessage() {
        console.log('\n🎉 Setup completed successfully!')
        console.log('\n🚀 Next steps:')
        console.log('  1. Start the dashboard server:')
        console.log('     npm start')
        console.log('')
        console.log('  2. Open the dashboard:')
        console.log('     http://localhost:3001')
        console.log('')
        console.log('  3. Set up automated data collection:')
        console.log('     npm run collect -- --daemon')
        console.log('')
        console.log('📊 Available commands:')
        console.log('  npm start              - Start dashboard server')
        console.log('  npm run collect        - Collect metrics once')
        console.log('  npm run collect-weekly - Weekly metrics report')
        console.log('  npm run setup          - Run this setup again')
        console.log('')
        console.log('💡 Pro tip: Add to your crontab for automated collection:')
        console.log('  0 */4 * * * cd /path/to/console/tools/acm-metrics-dashboard && npm run collect')
    }
}

// Run setup if called directly
if (process.argv[1].endsWith('setup.js')) {
    const setup = new DashboardSetup()
    setup.run()
}
