/* Copyright Contributors to the Open Cluster Management project */

import type { MetricsData } from '../types/metrics'
import MetricCard from './MetricCard'
import VelocityScoreCard from './VelocityScoreCard'

interface MetricsGridProps {
  data: MetricsData
}

const MetricsGrid = ({ data }: MetricsGridProps) => {
  const { summary, breakdown } = data

  return (
    <div className="metrics-grid">
      <MetricCard
        title="📈 Overall Completion Rate"
        value={`${summary.completionRate}%`}
        label="Features & bugs completed"
        trend="📊 Tracking progress"
        tooltip="Percentage of features and bugs completed this period. Includes both GitHub issues and pull requests."
      />

      <MetricCard
        title="🎯 Features Completed"
        value={breakdown.features.completed.toString()}
        label={`out of ${breakdown.features.total} features`}
        trend="🚀 Building features"
      />

      <MetricCard
        title="🐛 Bugs Resolved"
        value={breakdown.bugs.resolved.toString()}
        label={`out of ${breakdown.bugs.total} bugs`}
        trend="🔧 Fixing issues"
      />

      <MetricCard
        title="🔀 PRs Merged"
        value={breakdown.pullRequests.merged.toString()}
        label={`out of ${breakdown.pullRequests.total} pull requests`}
        trend="⚡ Code reviews"
      />

      <MetricCard
        title="⏱️ Avg Cycle Time"
        value={`${summary.avgCycleTime}d`}
        label="days to completion"
        trend="🎯 Process efficiency"
        tooltip="Average time from when work starts until it's completed. Lower is better for faster delivery."
      />

      <VelocityScoreCard
        score={summary.healthScore}
        tooltip="Performance score based on completion rates, cycle times, and process efficiency. Scale: 0-100 (higher is better)"
      />
    </div>
  )
}

export default MetricsGrid
