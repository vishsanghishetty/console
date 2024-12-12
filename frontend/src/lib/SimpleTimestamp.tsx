/* Copyright Contributors to the Open Cluster Management project */

import React from 'react'

interface SimpleTimestampProps {
  timestamp: string | number | Date
}

export const SimpleTimestamp: React.FC<SimpleTimestampProps> = ({ timestamp }) => {
  const date = new Date(timestamp)
  return <>{date.toLocaleString()}</>
}

export default SimpleTimestamp
