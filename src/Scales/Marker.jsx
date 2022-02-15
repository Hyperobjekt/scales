import React from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { useScaleContext } from "./Scale";
import { animated, useSpring } from "react-spring";

const defaultRenderPointer = ({ color, position, value }) => {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" style={{ marginTop: -8 }}>
      <polygon points="0,2 8,2 4,8 0,2" fill={color} />
    </svg>
  );
};

/**
 * Marks a point along the scale
 */
const Marker = ({
  className,
  value,
  color: pointerColor,
  pointer,
  renderPointer = defaultRenderPointer,
  children,
  style: styleOverrides = {},
  ...props
}) => {
  const { type, position, color, margin } = useScaleContext();
  const hasValue = value || Number.isFinite(value);
  const leftPosition = !hasValue
    ? 0
    : type === "category"
    ? position(value) + position.bandwidth() / 2
    : position(value);
  const markerColor = hasValue ? color(value) : color(0);

  const pointerElement =
    pointer &&
    typeof renderPointer === "function" &&
    renderPointer({
      color: pointerColor || markerColor,
      position: leftPosition,
      value,
    });
  const markerProps = useSpring({
    left: leftPosition * 100 + "%",
    opacity: hasValue ? 1 : 0,
  });
  return (
    <div
      className={clsx("HypScale-markerRoot", className)}
      style={{
        position: "relative",
        marginLeft: margin.left,
        marginRight: margin.right,
        ...styleOverrides,
      }}
      {...props}
    >
      <animated.div
        className={clsx("HypScale-markerWrapper")}
        style={markerProps}
      >
        {pointer && pointerElement && (
          <div className="HypScale-pointerWrapper">{pointerElement}</div>
        )}
        {children}
      </animated.div>
    </div>
  );
};

Marker.propTypes = {
  /** The value of the marker (used for positioning) */
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Color of the pointer */
  pointerColor: PropTypes.string,
};

export default Marker;
