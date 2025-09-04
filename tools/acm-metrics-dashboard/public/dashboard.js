/* Copyright Contributors to the Open Cluster Management project */

// Dashboard JavaScript for ACM Metrics
class ACMDashboard {
    constructor() {
        this.currentPeriod = 'month'
        this.charts = {}
        this.data = null
        
        this.init()
    }
    
    init() {
        // Set up event listeners
        document.getElementById('period').addEventListener('change', (e) => {
            this.currentPeriod = e.target.value
            this.loadData()
        })
        
        // Load initial data
        this.loadData()
    }
    
    async loadData() {
        this.showLoading()
        
        try {
            const response = await fetch(`/api/summary?period=${this.currentPeriod}`)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            this.data = await response.json()
            this.updateDashboard()
            this.hideLoading()
            
        } catch (error) {
            console.error('Error loading data:', error)
            this.showError(`Failed to load metrics: ${error.message}`)
        }
    }
    
    updateDashboard() {
        if (!this.data) return
        
        // Update key metrics
        this.updateKeyMetrics()
        
        // Update charts
        this.updateCharts()
        
        // Update recommendations
        this.updateRecommendations()
        
        // Update last updated time
        document.getElementById('last-updated').textContent = 
            new Date(this.data.timestamp).toLocaleString()
    }
    
    updateKeyMetrics() {
        const { summary, breakdown, velocity } = this.data
        
        // Overall completion rate
        document.getElementById('completion-rate').textContent = `${summary.completionRate}%`
        
        // Features
        document.getElementById('features-completed').textContent = breakdown.features.completed
        document.getElementById('features-total').textContent = `out of ${breakdown.features.total} features`
        
        // Bugs
        document.getElementById('bugs-resolved').textContent = breakdown.bugs.resolved
        document.getElementById('bugs-total').textContent = `out of ${breakdown.bugs.total} bugs`
        
        // PRs
        document.getElementById('prs-merged').textContent = breakdown.pullRequests.merged
        document.getElementById('prs-total').textContent = `out of ${breakdown.pullRequests.total} pull requests`
        
        // Cycle time
        document.getElementById('cycle-time').textContent = `${summary.avgCycleTime}d`
        
        // Development Velocity Score (formerly health score)
        this.updateVelocityScore(summary.healthScore)
    }
    
    updateVelocityScore(score) {
        const circle = document.getElementById('health-circle')
        const label = document.getElementById('health-label')
        
        circle.textContent = `${score}`
        
        // Remove existing health classes
        circle.classList.remove('health-excellent', 'health-good', 'health-poor')
        
        if (score >= 80) {
            circle.classList.add('health-excellent')
            label.textContent = 'Excellent development velocity'
        } else if (score >= 60) {
            circle.classList.add('health-good')
            label.textContent = 'Good development velocity'
        } else {
            circle.classList.add('health-poor')
            label.textContent = 'Development velocity needs improvement'
        }
    }
    
    async updateCharts() {
        // Load trends data
        const trendsResponse = await fetch(`/api/trends?months=6`)
        const trendsData = await trendsResponse.json()
        
        this.updateTrendsChart(trendsData)
        this.updateContributionsChart()
        this.updateBreakdownChart()
    }
    
    updateTrendsChart(trendsData) {
        const ctx = document.getElementById('trendsChart').getContext('2d')
        
        if (this.charts.trends) {
            this.charts.trends.destroy()
        }
        
        const months = trendsData.trends.map(t => t.monthName)
        const featuresCompleted = trendsData.trends.map(t => t.features.completed)
        const bugsResolved = trendsData.trends.map(t => t.bugs.resolved)
        const prsMerged = trendsData.trends.map(t => t.prs.merged)
        
        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Features Completed',
                        data: featuresCompleted,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Bugs Resolved',
                        data: bugsResolved,
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72, 187, 120, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'PRs Merged',
                        data: prsMerged,
                        borderColor: '#ed8936',
                        backgroundColor: 'rgba(237, 137, 54, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        })
    }
    
    updateContributionsChart() {
        const ctx = document.getElementById('contributionsChart').getContext('2d')
        
        if (this.charts.contributions) {
            this.charts.contributions.destroy()
        }
        
        const contributions = this.data.teamContributions || {}
        const contributors = Object.keys(contributions).slice(0, 10) // Top 10
        const issuesCounts = contributors.map(c => contributions[c].issues || 0)
        const prsCounts = contributors.map(c => contributions[c].prs || 0)
        
        this.charts.contributions = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: contributors,
                datasets: [
                    {
                        label: 'Issues',
                        data: issuesCounts,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: '#667eea',
                        borderWidth: 1
                    },
                    {
                        label: 'Pull Requests',
                        data: prsCounts,
                        backgroundColor: 'rgba(237, 137, 54, 0.8)',
                        borderColor: '#ed8936',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        })
    }
    
    updateBreakdownChart() {
        const ctx = document.getElementById('breakdownChart').getContext('2d')
        
        if (this.charts.breakdown) {
            this.charts.breakdown.destroy()
        }
        
        const { breakdown } = this.data
        
        this.charts.breakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Features Completed', 'Bugs Resolved', 'PRs Merged', 'In Progress'],
                datasets: [{
                    data: [
                        breakdown.features.completed,
                        breakdown.bugs.resolved,
                        breakdown.pullRequests.merged,
                        (breakdown.features.total - breakdown.features.completed) +
                        (breakdown.bugs.total - breakdown.bugs.resolved) +
                        (breakdown.pullRequests.total - breakdown.pullRequests.merged)
                    ],
                    backgroundColor: [
                        '#667eea',
                        '#48bb78',
                        '#ed8936',
                        '#e2e8f0'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        })
    }
    
    updateRecommendations() {
        const recommendations = this.data.recommendations || []
        const section = document.getElementById('recommendations-section')
        const list = document.getElementById('recommendations-list')
        
        if (recommendations.length === 0) {
            section.style.display = 'none'
            return
        }
        
        section.style.display = 'block'
        list.innerHTML = ''
        
        recommendations.forEach(rec => {
            const div = document.createElement('div')
            div.className = `recommendation ${rec.priority}`
            div.innerHTML = `
                <div class="recommendation-title">${rec.message}</div>
                <div class="recommendation-action">Action: ${rec.action}</div>
            `
            list.appendChild(div)
        })
    }
    
    showLoading() {
        document.getElementById('loading').style.display = 'block'
        document.getElementById('content').style.display = 'none'
        document.getElementById('error').style.display = 'none'
    }
    
    hideLoading() {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('content').style.display = 'block'
    }
    
    showError(message) {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('content').style.display = 'none'
        document.getElementById('error').style.display = 'block'
        document.getElementById('error').textContent = message
    }
}

// Global functions
async function refreshData() {
    const btn = document.getElementById('refresh-btn')
    const originalText = btn.textContent
    
    btn.disabled = true
    btn.textContent = '🔄 Refreshing...'
    
    try {
        const response = await fetch('/api/refresh', { method: 'POST' })
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        
        // Reload dashboard data
        await dashboard.loadData()
        
    } catch (error) {
        alert(`Failed to refresh data: ${error.message}`)
    } finally {
        btn.disabled = false
        btn.textContent = originalText
    }
}

async function exportData() {
    const period = document.getElementById('period').value
    const url = `/api/export?format=csv&period=${period}`
    
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `acm-metrics-${period}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
        
    } catch (error) {
        alert(`Failed to export data: ${error.message}`)
    }
}

// Initialize dashboard when page loads
let dashboard
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ACMDashboard()
})
