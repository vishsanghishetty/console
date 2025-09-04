/* Copyright Contributors to the Open Cluster Management project */

import Tooltip from './Tooltip'

interface MetricCardProps {
  title: string
  value: string
  label: string
  trend?: string
  tooltip?: string
}

const MetricCard = ({ title, value, label, trend, tooltip }: MetricCardProps) => {
  return (
    <div className="metric-card">
      <h3>
        {title}
        {tooltip && <Tooltip text={tooltip} />}
      </h3>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {trend && (
        <div className="metric-trend">
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}

export default MetricCard
