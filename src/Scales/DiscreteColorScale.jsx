import React from "react";
import { getPositionScale } from "./utils";
import clsx from "clsx";

const DiscreteColorScale = ({
  chunks,
  width = 200,
  height = 12,
  margin = { left: 0, right: 0, top: 0, bottom: 0 },
  rectProps = {},
  className,
}) => {
  const innerWidth = width - (margin.left + margin.right);
  const positionRange = [1, innerWidth - 1];
  const percentToPosition = getPositionScale("linear", [0, 1], positionRange);
  return (
    <svg
      className={clsx("HypScale-colors", "HypScale-discrete", className)}
      width={width}
      height={height}
    >
      <g transform={`translate(${margin.left} ${margin.top})`}>
        {chunks.map((c, i) => (
          <rect
            key={c.value}
            x={percentToPosition(c.x)}
            y={0}
            height={height - (margin.bottom + margin.top)}
            width={c.width * innerWidth}
            style={{ fill: c.color }}
            {...rectProps}
          />
        ))}
      </g>
    </svg>
  );
};

export default DiscreteColorScale;
