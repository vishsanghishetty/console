/* Copyright Contributors to the Open Cluster Management project */

import { useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ContributionsChartProps {
  data: Record<string, {
    issues: number
    prs: number
    commits: number
    files: number
  }>
}

const ContributionsChart = ({ data }: ContributionsChartProps) => {
  const chartRef = useRef<ChartJS<'bar'> | null>(null)

  // Get top 10 contributors
  const contributors = Object.keys(data).slice(0, 10)
  const issuesCounts = contributors.map(c => data[c]?.issues || 0)
  const prsCounts = contributors.map(c => data[c]?.prs || 0)

  const chartData = {
    labels: contributors,
    datasets: [
      {
        label: 'Issues',
        data: issuesCounts,
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: '#667eea',
        borderWidth: 1,
      },
      {
        label: 'Pull Requests',
        data: prsCounts,
        backgroundColor: 'rgba(237, 137, 54, 0.8)',
        borderColor: '#ed8936',
        borderWidth: 1,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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

  return <Bar ref={chartRef} data={chartData} options={options} />
}

export default ContributionsChart
