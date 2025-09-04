/* Copyright Contributors to the Open Cluster Management project */

import type { MetricsData, TrendsData, FeatureMetrics, BugMetrics, PullRequestMetrics, Period } from '../types/metrics'

const API_BASE_URL = '/api'

class ApiService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  async getHealthCheck() {
    const response = await fetch('/health')
    return response.json()
  }

  async getSummary(period: Period = 'month'): Promise<MetricsData> {
    return this.fetchApi<MetricsData>(`/summary?period=${period}`)
  }

  async getVelocity(period: Period = 'month') {
    return this.fetchApi(`/velocity?period=${period}`)
  }

  async getFeatures(period: Period = 'month'): Promise<FeatureMetrics> {
    return this.fetchApi<FeatureMetrics>(`/features?period=${period}`)
  }

  async getBugs(period: Period = 'month'): Promise<BugMetrics> {
    return this.fetchApi<BugMetrics>(`/bugs?period=${period}`)
  }

  async getPullRequests(period: Period = 'month'): Promise<PullRequestMetrics> {
    return this.fetchApi<PullRequestMetrics>(`/pull-requests?period=${period}`)
  }

  async getCodeQuality(period: Period = 'month') {
    return this.fetchApi(`/code-quality?period=${period}`)
  }

  async getTrends(months: number = 6): Promise<TrendsData> {
    return this.fetchApi<TrendsData>(`/trends?months=${months}`)
  }

  async refreshData(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/refresh`, { method: 'POST' })
    
    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`)
    }
    
    return response.json()
  }

  async exportData(period: Period = 'month', format: 'json' | 'csv' = 'json') {
    const response = await fetch(`${API_BASE_URL}/export?format=${format}&period=${period}`)
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`)
    }
    
    if (format === 'csv') {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `acm-metrics-${period}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return { success: true }
    }
    
    return response.json()
  }
}

export const apiService = new ApiService()
