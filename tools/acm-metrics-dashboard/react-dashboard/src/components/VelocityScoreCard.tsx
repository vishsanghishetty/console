/* Copyright Contributors to the Open Cluster Management project */

import Tooltip from './Tooltip'

interface VelocityScoreCardProps {
  score: number
  tooltip?: string
}

const VelocityScoreCard = ({ score, tooltip }: VelocityScoreCardProps) => {
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'health-excellent'
    if (score >= 60) return 'health-good'
    return 'health-poor'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent development velocity'
    if (score >= 60) return 'Good development velocity'
    return 'Development velocity needs improvement'
  }

  return (
    <div className="metric-card health-score">
      <h3>
        ⚡ Development Velocity Score
        {tooltip && <Tooltip text={tooltip} />}
      </h3>
      <div className={`health-score-circle ${getScoreClass(score)}`}>
        {score}
      </div>
      <div className="metric-label">
        {getScoreLabel(score)}
      </div>
    </div>
  )
}

export default VelocityScoreCard
