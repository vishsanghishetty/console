/* Copyright Contributors to the Open Cluster Management project */

interface TooltipProps {
  text: string
}

const Tooltip = ({ text }: TooltipProps) => {
  return (
    <span className="tooltip">
      ⓘ
      <span className="tooltip-text">{text}</span>
    </span>
  )
}

export default Tooltip
