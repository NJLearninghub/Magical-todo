import React from 'react'
import Quadrant from './Quadrant'

export default function QuadrantGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 flex-1">
      <Quadrant quadrantId={1} />
      <Quadrant quadrantId={2} />
      <Quadrant quadrantId={3} />
      <Quadrant quadrantId={4} />
    </div>
  )
}
