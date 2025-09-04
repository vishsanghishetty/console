#!/usr/bin/env node

/* Test script to verify GitHub connection */

import { Octokit } from '@octokit/rest'

async function testConnection() {
    console.log('🔍 Testing GitHub connection...\n')
    
    if (!process.env.GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN environment variable not set!')
        console.log('\n💡 To fix this:')
        console.log('1. Get token from: https://github.com/settings/tokens')
        console.log('2. Set it: export GITHUB_TOKEN=your_token_here')
        console.log('3. Run this test again')
        process.exit(1)
    }
    
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    })
    
    try {
        // Test basic API access
        const { data: user } = await octokit.rest.users.getAuthenticated()
        console.log(`✅ Authenticated as: ${user.login}`)
        
        // Test repository access
        const { data: issues } = await octokit.rest.issues.listForRepo({
            owner: 'stolostron',
            repo: 'console',
            per_page: 5
        })
        console.log(`✅ Repository access: Found ${issues.length} recent issues`)
        
        // Test pull requests
        const { data: prs } = await octokit.rest.pulls.list({
            owner: 'stolostron',
            repo: 'console',
            per_page: 5
        })
        console.log(`✅ Pull request access: Found ${prs.length} recent PRs`)
        
        console.log('\n🎉 GitHub connection successful!')
        console.log('✅ You can now collect metrics with: npm run collect')
        
    } catch (error) {
        console.error('❌ GitHub connection failed:', error.message)
        
        if (error.status === 401) {
            console.log('\n💡 Token authentication failed:')
            console.log('- Check if your token is correct')
            console.log('- Ensure token has "repo" permissions')
            console.log('- Token might have expired')
        } else if (error.status === 404) {
            console.log('\n💡 Repository access denied:')
            console.log('- Token needs "repo" permission for private repos')
            console.log('- Check if stolostron/console repository exists')
        }
        
        process.exit(1)
    }
}

testConnection()
