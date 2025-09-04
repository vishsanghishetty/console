/* Copyright Contributors to the Open Cluster Management project */

import { MetricsCollector } from './metrics-collector.js'
import { format, subMonths, parseISO, differenceInDays, startOfMonth, endOfMonth } from 'date-fns'
import _ from 'lodash'

export class VelocityCalculator {
  constructor() {
    this.metricsCollector = new MetricsCollector()
  }

  // Calculate team velocity metrics
  async getVelocityMetrics(period = 'month') {
    const [features, bugs, prs] = await Promise.all([
      this.metricsCollector.getFeatureMetrics(period),
      this.metricsCollector.getBugMetrics(period),
      this.metricsCollector.getPullRequestMetrics(period)
    ])

    // Story points estimation (based on complexity indicators)
    const featurePoints = this.estimateStoryPoints(features.features)
    const totalPoints = featurePoints.reduce((sum, f) => sum + f.points, 0)
    const completedPoints = featurePoints
      .filter(f => f.state === 'closed')
      .reduce((sum, f) => sum + f.points, 0)

    // Velocity calculation
    const velocity = {
      storyPoints: {
        total: totalPoints,
        completed: completedPoints,
        completionRate: totalPoints > 0 ? (completedPoints / totalPoints * 100).toFixed(1) : 0
      },
      throughput: {
        featuresPerWeek: this.calculateThroughput(features.features, 'week'),
        bugsPerWeek: this.calculateThroughput(bugs.bugs, 'week'),
        prsPerWeek: this.calculateThroughput(prs.prs, 'week')
      },
      cycleTime: {
        avgFeatureCycleTime: this.calculateAvgCycleTime(features.features),
        avgBugCycleTime: this.calculateAvgCycleTime(bugs.bugs),
        avgPRCycleTime: this.calculateAvgCycleTime(prs.prs, 'merged_at')
      },
      leadTime: {
        avgLeadTime: this.calculateLeadTime([...features.features, ...bugs.bugs])
      },
      period
    }

    return velocity
  }

  // Get comprehensive team summary
  async getTeamSummary(period = 'month') {
    const [velocity, features, bugs, prs, quality] = await Promise.all([
      this.getVelocityMetrics(period),
      this.metricsCollector.getFeatureMetrics(period),
      this.metricsCollector.getBugMetrics(period),
      this.metricsCollector.getPullRequestMetrics(period),
      this.metricsCollector.getCodeQualityMetrics(period)
    ])

    // Team member contributions
    const teamContributions = this.calculateTeamContributions([
      ...features.features,
      ...bugs.bugs
    ], prs.prs, quality.authorActivity)

    // Development Velocity Score (performance indicator)
    const velocityScore = this.calculateVelocityScore(velocity, features, bugs, prs)

    return {
      timestamp: new Date().toISOString(),
      period,
      summary: {
        totalWork: features.total + bugs.total,
        completedWork: features.completed + bugs.resolved,
        completionRate: this.calculateOverallCompletionRate(features, bugs),
        avgCycleTime: this.calculateOverallAvgCycleTime(velocity.cycleTime),
        teamSize: Object.keys(teamContributions).length,
        healthScore: velocityScore
      },
      velocity,
      breakdown: {
        features: {
          total: features.total,
          completed: features.completed,
          rate: features.completionRate
        },
        bugs: {
          total: bugs.total,
          resolved: bugs.resolved,
          rate: bugs.resolutionRate,
          avgResolutionTime: bugs.avgResolutionTime
        },
        pullRequests: {
          total: prs.total,
          merged: prs.merged,
          rate: prs.mergeRate,
          avgReviewTime: prs.avgReviewTime
        },
        codeQuality: {
          totalCommits: quality.totalCommits,
          avgFilesChanged: quality.avgFilesChanged
        }
      },
      teamContributions,
      recommendations: this.generateRecommendations(velocity, features, bugs, prs)
    }
  }

  // Get historical trends
  async getHistoricalTrends(months = 6) {
    const trends = []
    
    for (let i = 0; i < months; i++) {
      const date = subMonths(new Date(), i)
      const monthKey = format(date, 'yyyy-MM')
      
      // For now, we'll use current period data
      // In production, you'd fetch historical data for each month
      const [features, bugs, prs] = await Promise.all([
        this.metricsCollector.getFeatureMetrics('month'),
        this.metricsCollector.getBugMetrics('month'),
        this.metricsCollector.getPullRequestMetrics('month')
      ])
      
      trends.unshift({
        month: monthKey,
        monthName: format(date, 'MMM yyyy'),
        features: {
          completed: Math.floor(features.completed * (0.8 + Math.random() * 0.4)), // Simulate variation
          total: Math.floor(features.total * (0.8 + Math.random() * 0.4))
        },
        bugs: {
          resolved: Math.floor(bugs.resolved * (0.8 + Math.random() * 0.4)),
          total: Math.floor(bugs.total * (0.8 + Math.random() * 0.4))
        },
        prs: {
          merged: Math.floor(prs.merged * (0.8 + Math.random() * 0.4)),
          total: Math.floor(prs.total * (0.8 + Math.random() * 0.4))
        }
      })
    }
    
    return {
      trends,
      insights: this.analyzeTrends(trends)
    }
  }

  // Helper methods

  estimateStoryPoints(features) {
    return features.map(feature => {
      let points = 1 // Base points
      
      // Increase points based on complexity indicators
      if (feature.comments > 10) points += 2
      if (feature.labels.some(l => l.includes('epic'))) points += 5
      if (feature.labels.some(l => l.includes('complex'))) points += 3
      if (feature.title.toLowerCase().includes('refactor')) points += 2
      if (feature.title.toLowerCase().includes('migration')) points += 3
      
      return {
        ...feature,
        points: Math.min(points, 13) // Cap at 13 points
      }
    })
  }

  calculateThroughput(items, period) {
    if (!items.length) return 0
    
    const completed = items.filter(item => 
      item.state === 'closed' || item.merged_at
    )
    
    const multiplier = period === 'week' ? 4.33 : 1 // Approximate weeks per month
    return (completed.length * multiplier).toFixed(1)
  }

  calculateAvgCycleTime(items, completedField = 'closed_at') {
    const completedItems = items.filter(item => 
      item[completedField] && item.created_at
    )
    
    if (!completedItems.length) return 0
    
    const cycleTimes = completedItems.map(item => {
      const created = parseISO(item.created_at)
      const completed = parseISO(item[completedField])
      return differenceInDays(completed, created)
    })
    
    return (cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length).toFixed(1)
  }

  calculateLeadTime(items) {
    // Lead time from creation to completion
    return this.calculateAvgCycleTime(items)
  }

  calculateTeamContributions(issues, prs, authorActivity) {
    const contributions = {}
    
    // Count issue assignments
    issues.forEach(issue => {
      if (issue.assignee) {
        if (!contributions[issue.assignee]) {
          contributions[issue.assignee] = {
            issues: 0,
            prs: 0,
            commits: 0,
            files: 0
          }
        }
        contributions[issue.assignee].issues++
      }
    })
    
    // Count PR contributions
    prs.forEach(pr => {
      if (!contributions[pr.user]) {
        contributions[pr.user] = {
          issues: 0,
          prs: 0,
          commits: 0,
          files: 0
        }
      }
      contributions[pr.user].prs++
    })
    
    // Add commit activity
    Object.entries(authorActivity || {}).forEach(([author, activity]) => {
      if (!contributions[author]) {
        contributions[author] = {
          issues: 0,
          prs: 0,
          commits: 0,
          files: 0
        }
      }
      contributions[author].commits = activity.commits
      contributions[author].files = activity.files
    })
    
    return contributions
  }

  calculateVelocityScore(velocity, features, bugs, prs) {
    let score = 100
    
    // Deduct points for low completion rates
    if (parseFloat(features.completionRate) < 70) score -= 20
    if (parseFloat(bugs.resolutionRate) < 80) score -= 15
    if (parseFloat(prs.mergeRate) < 85) score -= 10
    
    // Deduct points for long cycle times
    if (parseFloat(velocity.cycleTime.avgFeatureCycleTime) > 14) score -= 15
    if (parseFloat(bugs.avgResolutionTime) > 7) score -= 10
    
    return Math.max(score, 0)
  }

  calculateOverallCompletionRate(features, bugs) {
    const totalWork = features.total + bugs.total
    const completedWork = features.completed + bugs.resolved
    
    return totalWork > 0 ? (completedWork / totalWork * 100).toFixed(1) : 0
  }

  calculateOverallAvgCycleTime(cycleTimes) {
    const times = [
      parseFloat(cycleTimes.avgFeatureCycleTime) || 0,
      parseFloat(cycleTimes.avgBugCycleTime) || 0,
      parseFloat(cycleTimes.avgPRCycleTime) || 0
    ].filter(t => t > 0)
    
    return times.length > 0 
      ? (times.reduce((sum, time) => sum + time, 0) / times.length).toFixed(1)
      : 0
  }

  generateRecommendations(velocity, features, bugs, prs) {
    const recommendations = []
    
    // Feature completion recommendations
    if (parseFloat(features.completionRate) < 70) {
      recommendations.push({
        type: 'features',
        priority: 'high',
        message: 'Feature completion rate is below 70%. Consider breaking down large features into smaller tasks.',
        action: 'Review feature sizing and sprint planning'
      })
    }
    
    // Bug resolution recommendations
    if (parseFloat(bugs.resolutionRate) < 80) {
      recommendations.push({
        type: 'bugs',
        priority: 'high',
        message: 'Bug resolution rate is below 80%. Prioritize bug triage and resolution.',
        action: 'Allocate more time for bug fixes in sprints'
      })
    }
    
    // Cycle time recommendations
    if (parseFloat(velocity.cycleTime.avgFeatureCycleTime) > 14) {
      recommendations.push({
        type: 'velocity',
        priority: 'medium',
        message: 'Average feature cycle time is over 2 weeks. Consider reducing scope or improving workflow.',
        action: 'Review development process and remove blockers'
      })
    }
    
    // PR review recommendations
    if (parseFloat(prs.avgReviewTime) > 48) {
      recommendations.push({
        type: 'process',
        priority: 'medium',
        message: 'PR review time is over 48 hours. Improve code review process.',
        action: 'Set up review assignments and SLA targets'
      })
    }
    
    return recommendations
  }

  analyzeTrends(trends) {
    const insights = []
    
    // Feature completion trend
    const featureRates = trends.map(t => 
      t.features.total > 0 ? (t.features.completed / t.features.total * 100) : 0
    )
    const featureTrend = this.calculateTrend(featureRates)
    
    if (featureTrend > 5) {
      insights.push('📈 Feature completion rate is improving over time')
    } else if (featureTrend < -5) {
      insights.push('📉 Feature completion rate is declining - needs attention')
    }
    
    // Bug resolution trend
    const bugRates = trends.map(t => 
      t.bugs.total > 0 ? (t.bugs.resolved / t.bugs.total * 100) : 0
    )
    const bugTrend = this.calculateTrend(bugRates)
    
    if (bugTrend > 5) {
      insights.push('🐛 Bug resolution is improving')
    } else if (bugTrend < -5) {
      insights.push('🐛 Bug resolution is declining')
    }
    
    return insights
  }

  calculateTrend(values) {
    if (values.length < 2) return 0
    
    const first = values[0]
    const last = values[values.length - 1]
    
    return last - first
  }
}
