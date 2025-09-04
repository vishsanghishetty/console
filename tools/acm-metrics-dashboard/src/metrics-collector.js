/* Copyright Contributors to the Open Cluster Management project */

import { Octokit } from '@octokit/rest'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { format, subDays, subWeeks, subMonths, parseISO, isAfter } from 'date-fns'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class MetricsCollector {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      request: {
        retries: 3,
        retryAfter: 2
      }
    })
    
    this.owner = 'stolostron'
    this.repo = 'console'
    this.dataDir = path.join(__dirname, '../data')
    
    // Ensure data directory exists
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true })
    }
  }

  // Get date range for period
  getDateRange(period) {
    const now = new Date()
    let since
    
    switch (period) {
      case 'week':
        since = subWeeks(now, 1)
        break
      case 'month':
        since = subMonths(now, 1)
        break
      case 'quarter':
        since = subMonths(now, 3)
        break
      default:
        since = subMonths(now, 1)
    }
    
    return { since, until: now }
  }

  // Collect all metrics
  async collectAllMetrics() {
    console.log('📊 Collecting ACM team metrics...')
    
    try {
      const [issues, pullRequests, commits] = await Promise.all([
        this.fetchIssues(),
        this.fetchPullRequests(),
        this.fetchCommits()
      ])
      
      const metrics = {
        timestamp: new Date().toISOString(),
        issues,
        pullRequests,
        commits
      }
      
      // Save to file
      const filename = `metrics-${format(new Date(), 'yyyy-MM-dd')}.json`
      writeFileSync(path.join(this.dataDir, filename), JSON.stringify(metrics, null, 2))
      
      // Update latest
      writeFileSync(path.join(this.dataDir, 'latest.json'), JSON.stringify(metrics, null, 2))
      
      console.log(`✅ Metrics collected and saved to ${filename}`)
      return metrics
      
    } catch (error) {
      console.error('❌ Error collecting metrics:', error)
      throw error
    }
  }

  // Fetch GitHub issues
  async fetchIssues() {
    console.log('🔍 Fetching GitHub issues...')
    
    try {
      const { data: issues } = await this.octokit.rest.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state: 'all',
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      })
      
      // Filter out pull requests (GitHub API includes PRs in issues)
      const actualIssues = issues.filter(issue => !issue.pull_request)
      
      console.log(`📋 Fetched ${actualIssues.length} issues`)
      return actualIssues
      
    } catch (error) {
      console.error('❌ Error fetching issues:', error)
      return []
    }
  }

  // Fetch GitHub pull requests
  async fetchPullRequests() {
    console.log('🔍 Fetching pull requests...')
    
    try {
      const { data: pullRequests } = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'all',
        per_page: 100,
        sort: 'updated',
        direction: 'desc'
      })
      
      console.log(`🔀 Fetched ${pullRequests.length} pull requests`)
      return pullRequests
      
    } catch (error) {
      console.error('❌ Error fetching pull requests:', error)
      return []
    }
  }

  // Fetch recent commits
  async fetchCommits() {
    console.log('🔍 Fetching recent commits...')
    
    try {
      const { data: commits } = await this.octokit.rest.repos.listCommits({
        owner: this.owner,
        repo: this.repo,
        per_page: 100,
        since: subDays(new Date(), 30).toISOString()
      })
      
      console.log(`💾 Fetched ${commits.length} commits`)
      return commits
      
    } catch (error) {
      console.error('❌ Error fetching commits:', error)
      return []
    }
  }

  // Get feature completion metrics
  async getFeatureMetrics(period = 'month') {
    const { since, until } = this.getDateRange(period)
    const data = this.getLatestData()
    
    if (!data) return { features: [], total: 0, completed: 0 }
    
    // Use Pull Requests as primary source since many teams don't use GitHub Issues
    let features = []
    
    // Try to get features from issues first
    if (data.issues && data.issues.length > 0) {
      features = data.issues.filter(issue => {
        const isFeature = issue.labels && issue.labels.some(label => 
          ['enhancement', 'feature', 'epic'].includes(label.name.toLowerCase())
        )
        const inPeriod = issue.updated_at && isAfter(parseISO(issue.updated_at), since)
        return isFeature && inPeriod
      })
    }
    
    // If no issues or no feature issues, use PRs as features
    if (features.length === 0 && data.pullRequests) {
      features = data.pullRequests.filter(pr => {
        const inPeriod = pr.updated_at && isAfter(parseISO(pr.updated_at), since)
        // Consider PRs that aren't just bug fixes as features
        const isFeature = !pr.title.toLowerCase().includes('fix') || 
                         pr.title.toLowerCase().includes('feature') ||
                         pr.title.toLowerCase().includes('add') ||
                         pr.title.toLowerCase().includes('implement')
        return inPeriod && isFeature
      })
    }
    
    const completed = features.filter(f => f.state === 'closed' || f.merged_at).length
    const total = features.length
    
    // Calculate completion rate by month
    const monthlyCompletion = this.calculateMonthlyCompletion(features)
    
    return {
      features: features.map(f => ({
        title: f.title,
        number: f.number,
        state: f.state,
        created_at: f.created_at,
        closed_at: f.closed_at,
        assignee: f.assignee?.login,
        labels: f.labels.map(l => l.name),
        comments: f.comments
      })),
      total,
      completed,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0,
      monthlyCompletion,
      period
    }
  }

  // Get bug resolution metrics
  async getBugMetrics(period = 'month') {
    const { since, until } = this.getDateRange(period)
    const data = this.getLatestData()
    
    if (!data) return { bugs: [], total: 0, resolved: 0 }
    
    // Use Pull Requests as primary source for bug fixes
    let bugs = []
    
    // Try to get bugs from issues first
    if (data.issues && data.issues.length > 0) {
      bugs = data.issues.filter(issue => {
        const isBug = issue.labels && issue.labels.some(label => 
          ['bug', 'defect', 'issue'].includes(label.name.toLowerCase())
        )
        const inPeriod = issue.updated_at && isAfter(parseISO(issue.updated_at), since)
        return isBug && inPeriod
      })
    }
    
    // If no issues or no bug issues, use PRs that look like bug fixes
    if (bugs.length === 0 && data.pullRequests) {
      bugs = data.pullRequests.filter(pr => {
        const inPeriod = pr.updated_at && isAfter(parseISO(pr.updated_at), since)
        // Consider PRs with "fix", "bug", "patch", "hotfix" as bug fixes
        const isBugFix = pr.title.toLowerCase().includes('fix') ||
                        pr.title.toLowerCase().includes('bug') ||
                        pr.title.toLowerCase().includes('patch') ||
                        pr.title.toLowerCase().includes('hotfix') ||
                        pr.title.toLowerCase().includes('resolve')
        return inPeriod && isBugFix
      })
    }
    
    const resolved = bugs.filter(b => b.state === 'closed' || b.merged_at).length
    const total = bugs.length
    
    // Calculate resolution time
    const resolutionTimes = bugs
      .filter(b => b.state === 'closed' && b.closed_at && b.created_at)
      .map(b => {
        const created = parseISO(b.created_at)
        const closed = parseISO(b.closed_at)
        return (closed - created) / (1000 * 60 * 60 * 24) // days
      })
    
    const avgResolutionTime = resolutionTimes.length > 0 
      ? (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1)
      : 0
    
    return {
      bugs: bugs.map(b => ({
        title: b.title,
        number: b.number,
        state: b.state,
        created_at: b.created_at,
        closed_at: b.closed_at,
        assignee: b.assignee?.login,
        labels: b.labels.map(l => l.name),
        priority: this.extractPriority(b.labels)
      })),
      total,
      resolved,
      resolutionRate: total > 0 ? (resolved / total * 100).toFixed(1) : 0,
      avgResolutionTime,
      period
    }
  }

  // Get pull request metrics
  async getPullRequestMetrics(period = 'month') {
    const { since, until } = this.getDateRange(period)
    const data = this.getLatestData()
    
    if (!data || !data.pullRequests) return { prs: [], total: 0, merged: 0 }
    
    const prs = data.pullRequests.filter(pr => 
      pr.updated_at && isAfter(parseISO(pr.updated_at), since)
    )
    
    const merged = prs.filter(pr => pr.merged_at).length
    const total = prs.length
    
    // Calculate review time
    const reviewTimes = prs
      .filter(pr => pr.merged_at && pr.created_at)
      .map(pr => {
        const created = parseISO(pr.created_at)
        const merged = parseISO(pr.merged_at)
        return (merged - created) / (1000 * 60 * 60) // hours
      })
    
    const avgReviewTime = reviewTimes.length > 0 
      ? (reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length).toFixed(1)
      : 0
    
    return {
      prs: prs.map(pr => ({
        title: pr.title,
        number: pr.number,
        state: pr.state,
        created_at: pr.created_at,
        merged_at: pr.merged_at,
        closed_at: pr.closed_at,
        user: pr.user.login,
        additions: pr.additions,
        deletions: pr.deletions,
        changed_files: pr.changed_files,
        comments: pr.comments,
        review_comments: pr.review_comments
      })),
      total,
      merged,
      mergeRate: total > 0 ? (merged / total * 100).toFixed(1) : 0,
      avgReviewTime,
      period
    }
  }

  // Get code quality metrics
  async getCodeQualityMetrics(period = 'month') {
    const data = this.getLatestData()
    
    if (!data) return { commits: [], totalCommits: 0, avgFilesChanged: 0 }
    
    const { since } = this.getDateRange(period)
    const commits = (data.commits || []).filter(commit => 
      commit.commit.author.date && isAfter(parseISO(commit.commit.author.date), since)
    )
    
    // Calculate code churn metrics
    const filesChanged = commits.map(c => c.files?.length || 0)
    const avgFilesChanged = filesChanged.length > 0 
      ? (filesChanged.reduce((a, b) => a + b, 0) / filesChanged.length).toFixed(1)
      : 0
    
    // Author activity
    const authorActivity = {}
    commits.forEach(commit => {
      const author = commit.commit.author.name
      if (!authorActivity[author]) {
        authorActivity[author] = { commits: 0, files: 0 }
      }
      authorActivity[author].commits++
      authorActivity[author].files += (commit.files?.length || 0)
    })
    
    return {
      commits: commits.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
        filesChanged: c.files?.length || 0
      })),
      totalCommits: commits.length,
      avgFilesChanged,
      authorActivity,
      period
    }
  }

  // Export metrics in different formats
  async exportMetrics(period, format = 'json') {
    const [features, bugs, prs, quality] = await Promise.all([
      this.getFeatureMetrics(period),
      this.getBugMetrics(period),
      this.getPullRequestMetrics(period),
      this.getCodeQualityMetrics(period)
    ])
    
    const data = {
      timestamp: new Date().toISOString(),
      period,
      features,
      bugs,
      pullRequests: prs,
      codeQuality: quality
    }
    
    if (format === 'csv') {
      return this.convertToCSV(data)
    }
    
    return JSON.stringify(data, null, 2)
  }

  // Helper methods
  getLatestData() {
    const latestPath = path.join(this.dataDir, 'latest.json')
    if (!existsSync(latestPath)) return null
    
    try {
      return JSON.parse(readFileSync(latestPath, 'utf8'))
    } catch (error) {
      console.error('Error reading latest data:', error)
      return null
    }
  }

  calculateMonthlyCompletion(features) {
    const monthly = {}
    
    features.forEach(feature => {
      if (feature.closed_at) {
        const month = format(parseISO(feature.closed_at), 'yyyy-MM')
        monthly[month] = (monthly[month] || 0) + 1
      }
    })
    
    return monthly
  }

  extractPriority(labels) {
    const priorityLabel = labels.find(label => 
      label.name.toLowerCase().includes('priority') || 
      label.name.toLowerCase().includes('critical') ||
      label.name.toLowerCase().includes('urgent')
    )
    
    return priorityLabel ? priorityLabel.name : 'normal'
  }

  convertToCSV(data) {
    // Simple CSV conversion for features
    let csv = 'Type,Title,Number,State,Created,Closed,Assignee\n'
    
    data.features.features.forEach(f => {
      csv += `Feature,"${f.title}",${f.number},${f.state},${f.created_at},${f.closed_at || ''},${f.assignee || ''}\n`
    })
    
    data.bugs.bugs.forEach(b => {
      csv += `Bug,"${b.title}",${b.number},${b.state},${b.created_at},${b.closed_at || ''},${b.assignee || ''}\n`
    })
    
    return csv
  }
}
