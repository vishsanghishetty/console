/* Copyright Contributors to the Open Cluster Management project */

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { TrendsData } from '../../types/metrics'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface TrendsChartProps {
  data: TrendsData
}

const TrendsChart = ({ data }: TrendsChartProps) => {
  const chartRef = useRef<ChartJS<'line'> | null>(null)

  const chartData = {
    labels: data.trends.map(t => t.monthName),
    datasets: [
      {
        label: 'Features Completed',
        data: data.trends.map(t => t.features.completed),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Bugs Resolved',
        data: data.trends.map(t => t.bugs.resolved),
        borderColor: '#48bb78',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'PRs Merged',
        data: data.trends.map(t => t.prs.merged),
        borderColor: '#ed8936',
        backgroundColor: 'rgba(237, 137, 54, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
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
      mode: 'index' as const
    }
  }

  return <Line ref={chartRef} data={chartData} options={options} />
}

export default TrendsChart
