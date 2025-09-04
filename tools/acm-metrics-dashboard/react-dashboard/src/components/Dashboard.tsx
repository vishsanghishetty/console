/* Copyright Contributors to the Open Cluster Management project */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import type { Period } from '../types/metrics'
import Header from './Header'
import Controls from './Controls'
import MetricsGrid from './MetricsGrid'
import ChartsSection from './ChartsSection'
import Recommendations from './Recommendations'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

const Dashboard = () => {
  const [period, setPeriod] = useState<Period>('month')

  const {
    data: metricsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['metrics', period],
    queryFn: () => apiService.getSummary(period),
    refetchOnWindowFocus: false,
  })

  const {
    data: trendsData,
    isLoading: trendsLoading
  } = useQuery({
    queryKey: ['trends'],
    queryFn: () => apiService.getTrends(6),
    refetchOnWindowFocus: false,
  })

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod)
  }

  const handleRefresh = async () => {
    try {
      await apiService.refreshData()
      await refetch()
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const handleExport = async () => {
    try {
      await apiService.exportData(period, 'csv')
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage error={error as Error} onRetry={() => refetch()} />
  }

  if (!metricsData) {
    return <ErrorMessage error={new Error('No data available')} onRetry={() => refetch()} />
  }

  return (
    <div className="dashboard-container">
      <Header />
      
      <Controls
        period={period}
        onPeriodChange={handlePeriodChange}
        onRefresh={handleRefresh}
        onExport={handleExport}
        lastUpdated={metricsData.timestamp}
      />

      <div className="dashboard">
        <MetricsGrid data={metricsData} />
        
        <ChartsSection 
          data={metricsData} 
          trendsData={trendsData}
          isLoading={trendsLoading}
        />
        
        {metricsData.recommendations.length > 0 && (
          <Recommendations recommendations={metricsData.recommendations} />
        )}
      </div>
    </div>
  )
}

export default Dashboard
