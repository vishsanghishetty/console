/* Copyright Contributors to the Open Cluster Management project */

import { useRef } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import type { MetricsData } from '../../types/metrics'

ChartJS.register(ArcElement, Tooltip, Legend)

interface BreakdownChartProps {
  data: MetricsData['breakdown']
}

const BreakdownChart = ({ data }: BreakdownChartProps) => {
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null)

  const inProgress = (data.features.total - data.features.completed) +
                    (data.bugs.total - data.bugs.resolved) +
                    (data.pullRequests.total - data.pullRequests.merged)

  const chartData = {
    labels: ['Features Completed', 'Bugs Resolved', 'PRs Merged', 'In Progress'],
    datasets: [{
      data: [
        data.features.completed,
        data.bugs.resolved,
        data.pullRequests.merged,
        inProgress
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
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      }
    }
  }

  return <Doughnut ref={chartRef} data={chartData} options={options} />
}

export default BreakdownChart
