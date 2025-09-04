/* Copyright Contributors to the Open Cluster Management project */

import { useState } from 'react'
import type { Period } from '../types/metrics'

interface ControlsProps {
  period: Period
  onPeriodChange: (period: Period) => void
  onRefresh: () => Promise<void>
  onExport: () => Promise<void>
  lastUpdated: string
}

const Controls = ({ period, onPeriodChange, onRefresh, onExport, lastUpdated }: ControlsProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport()
    } finally {
      setIsExporting(false)
    }
  }

  const formatLastUpdated = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="controls">
      <div className="controls-left">
        <label htmlFor="period">Time Period:</label>
        <select
          id="period"
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as Period)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
        </select>
      </div>

      <div className="controls-center">
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="refresh-btn"
        >
          {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
        </button>
        
        <button 
          onClick={handleExport} 
          disabled={isExporting}
          className="export-btn"
        >
          {isExporting ? '📊 Exporting...' : '📊 Export CSV'}
        </button>
      </div>

      <div className="controls-right">
        <span className="last-updated">
          Last updated: {formatLastUpdated(lastUpdated)}
        </span>
      </div>
    </div>
  )
}

export default Controls
