import React, { useEffect, useMemo, useRef } from "react";
import { getColors } from "./utils";
import clsx from "clsx";

const ContinuousColorScale = ({
  colors: schemaName,
  points = 256,
  width = 200,
  height = 12,
  margin = { left: 0, right: 0, top: 0, bottom: 0 },
  className,
  ...props
}) => {
  const canvasRef = useRef(null);
  const colors = useMemo(() => {
    return getColors(schemaName, points);
  }, [points, schemaName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    const context = canvas.getContext("2d");
    for (let i = 0; i < points; ++i) {
      context.fillStyle = colors[i];
      context.fillRect(i, 0, 1, 1);
    }
  }, [width, height, points, colors]);

  return (
    <div
      style={{
        width,
        height,
        paddingTop: margin.top,
        paddingRight: margin.right,
        paddingBottom: margin.bottom,
        paddingLeft: margin.left,
      }}
      className={clsx("HypScale-colors", "HypScale-continuous", className)}
      {...props}
    >
      <canvas width={points} height={1} ref={canvasRef} />
    </div>
  );
};

export default ContinuousColorScale;
