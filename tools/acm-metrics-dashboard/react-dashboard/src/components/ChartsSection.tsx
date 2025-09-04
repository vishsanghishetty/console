/* Copyright Contributors to the Open Cluster Management project */

import type { MetricsData, TrendsData } from '../types/metrics'
import TrendsChart from './charts/TrendsChart'
import ContributionsChart from './charts/ContributionsChart'
import BreakdownChart from './charts/BreakdownChart'

interface ChartsSectionProps {
  data: MetricsData
  trendsData?: TrendsData
  isLoading: boolean
}

const ChartsSection = ({ data, trendsData, isLoading }: ChartsSectionProps) => {
  return (
    <div className="charts-section">
      <div className="chart-container">
        <h3>📊 Historical Trends</h3>
        <div className="chart-wrapper">
          {isLoading ? (
            <div className="chart-loading">Loading trends...</div>
          ) : trendsData ? (
            <TrendsChart data={trendsData} />
          ) : (
            <div className="chart-error">Failed to load trends data</div>
          )}
        </div>
      </div>

      <div className="chart-container">
        <h3>👥 Team Contributions</h3>
        <div className="chart-wrapper">
          <ContributionsChart data={data.teamContributions} />
        </div>
      </div>

      <div className="chart-container">
        <h3>🎯 Work Breakdown</h3>
        <div className="chart-wrapper">
          <BreakdownChart data={data.breakdown} />
        </div>
      </div>
    </div>
  )
}

export default ChartsSection
