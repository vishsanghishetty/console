/* Copyright Contributors to the Open Cluster Management project */

import type { Recommendation } from '../types/metrics'

interface RecommendationsProps {
  recommendations: Recommendation[]
}

const Recommendations = ({ recommendations }: RecommendationsProps) => {
  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="recommendations">
      <h3>💡 Recommendations</h3>
      <div className="recommendations-list">
        {recommendations.map((rec, index) => (
          <div key={index} className={`recommendation ${rec.priority}`}>
            <div className="recommendation-title">{rec.message}</div>
            <div className="recommendation-action">Action: {rec.action}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Recommendations
