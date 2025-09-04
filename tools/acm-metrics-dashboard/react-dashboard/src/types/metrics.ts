/* Copyright Contributors to the Open Cluster Management project */

export interface MetricsData {
  timestamp: string
  period: string
  summary: {
    totalWork: number
    completedWork: number
    completionRate: string
    avgCycleTime: string
    teamSize: number
    healthScore: number
  }
  velocity: {
    storyPoints: {
      total: number
      completed: number
      completionRate: string
    }
    throughput: {
      featuresPerWeek: string
      bugsPerWeek: string
      prsPerWeek: string
    }
    cycleTime: {
      avgFeatureCycleTime: string
      avgBugCycleTime: string
      avgPRCycleTime: string
    }
    leadTime: {
      avgLeadTime: string
    }
    period: string
  }
  breakdown: {
    features: {
      total: number
      completed: number
      rate: string
    }
    bugs: {
      total: number
      resolved: number
      rate: string
      avgResolutionTime: string
    }
    pullRequests: {
      total: number
      merged: number
      rate: string
      avgReviewTime: string
    }
    codeQuality: {
      totalCommits: number
      avgFilesChanged: string
    }
  }
  teamContributions: Record<string, {
    issues: number
    prs: number
    commits: number
    files: number
  }>
  recommendations: Recommendation[]
}

export interface Recommendation {
  type: string
  priority: 'high' | 'medium' | 'low'
  message: string
  action: string
}

export interface TrendsData {
  trends: TrendPoint[]
  insights: string[]
}

export interface TrendPoint {
  month: string
  monthName: string
  features: {
    completed: number
    total: number
  }
  bugs: {
    resolved: number
    total: number
  }
  prs: {
    merged: number
    total: number
  }
}

export interface FeatureMetrics {
  features: any[]
  total: number
  completed: number
  completionRate: string
  monthlyCompletion: Record<string, number>
  period: string
}

export interface BugMetrics {
  bugs: any[]
  total: number
  resolved: number
  resolutionRate: string
  avgResolutionTime: string
  period: string
}

export interface PullRequestMetrics {
  prs: any[]
  total: number
  merged: number
  mergeRate: string
  avgReviewTime: string
  period: string
}

export type Period = 'week' | 'month' | 'quarter'
