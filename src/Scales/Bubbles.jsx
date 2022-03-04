import React from "react";
import PropTypes from "prop-types";
import deepmerge from "deepmerge";
import clsx from "clsx";
import { useScaleContext } from ".";
import { animated, useSpring } from "@react-spring/web";

const defaultTheme = {
  bubble: {
    strokeWidth: 1,
  },
  highlightBubble: {
    strokeWidth: 2,
  },
  highlightLine: {},
  highlightText: {},
  text: {
    fontSize: 12,
    fill: "currentColor",
    textAnchor: "start",
    alignmentBaseline: "central",
    fillOpacity: 1,
  },
  line: {
    stroke: "currentColor",
    strokeWidth: 1,
  },
};

/**
 * Returns the Y position for the annotation on a bubble
 */
const getAnnotationPosition = (sizes, currentSize) => {
  const sorted = sizes.slice().sort((a, b) => a - b);
  const currentIndex = sorted.findIndex((s) => s === currentSize);
  const previousHeight = currentIndex === 0 ? 0 : sizes[currentIndex - 1] * 2;
  const currentHeight = currentSize * 2;
  return (currentHeight - previousHeight) / 2 + previousHeight;
};

/**
 * Renders a circle with optional label
 * @returns
 */
const Bubble = ({
  cx,
  cy,
  size,
  label,
  labelY,
  labelX,
  fill,
  stroke,
  theme = { bubble: {}, line: {}, text: {} },
  ...props
}) => {
  const hasLabel = label || Number.isFinite(label);
  const circleProps = useSpring({
    cx,
    cy,
    r: size,
    fill,
    stroke,
  });
  const lineProps = useSpring({
    x1: cx,
    x2: labelX,
    y1: labelY || 0,
    y2: labelY || 0,
  });
  const textProps = useSpring({ x: labelX + 8, y: labelY || 0 });
  return (
    <g {...props}>
      <animated.circle {...circleProps} fill="#fff" fillOpacity="1" />
      <animated.circle
        fill={fill}
        stroke={stroke}
        {...circleProps}
        {...theme.bubble}
      />
      {hasLabel && <animated.line {...lineProps} {...theme.line} />}
      {hasLabel && (
        <animated.text {...textProps} {...theme.text}>
          {label}
        </animated.text>
      )}
    </g>
  );
};

/**
 * Renders a collection of bubbles with annotations
 */
const Bubbles = ({
  count,
  minSize,
  maxSize,
  margin,
  lineLength,
  highlight,
  formatLabel,
  theme: providedTheme,
  fillOpacity,
  children,
  ...props
}) => {
  const { color, chunks, size } = useScaleContext();
  const theme = deepmerge(defaultTheme, providedTheme);
  const mx = margin.left + margin.right;
  const my = margin.top + margin.bottom;
  const maxRadius = maxSize / 2;
  const width = maxSize + lineLength;
  const height = maxSize;
  const scale = size;
  const colorScale = color;
  const sizes = chunks;
  const hasHighlight = Number.isFinite(highlight);
  const highlightSize = scale(highlight) / 2;
  const highlightYPos =
    highlight && height - getAnnotationPosition([highlightSize], highlightSize);
  const highlightColor = hasHighlight
    ? colorScale(scale.invert(highlightSize * 2))
    : "transparent";

  const containerStyle = useSpring({
    opacity: hasHighlight ? 0.2 : 1,
  });
  return (
    <svg
      width={width + mx}
      height={height + my}
      className={clsx("HypBubble-root", {
        "HypBubble-highlighted": highlight,
      })}
      {...props}
    >
      <animated.g
        className="HypBubble-bubbles"
        transform={`translate(${margin.left},${margin.top})`}
        {...containerStyle}
      >
        {sizes
          .slice()
          .reverse()
          .map((s, i) => {
            const yPos = height - getAnnotationPosition(sizes, s);
            const color = colorScale(scale.invert(s * 2));
            return (
              <Bubble
                key={s}
                className="HypBubble-bubble"
                cx={maxRadius}
                cy={height - s}
                size={s}
                label={!highlight && formatLabel(scale.invert(s * 2))}
                labelX={maxRadius * 2 + lineLength}
                labelY={yPos}
                stroke={color}
                fill={color}
                fillOpacity={fillOpacity}
                theme={theme}
              />
            );
          })}
      </animated.g>
      <Bubble
        className="HypBubble-highlight"
        transform={`translate(${margin.left},${margin.top})`}
        cx={maxRadius}
        cy={hasHighlight ? height - highlightSize : height}
        size={hasHighlight ? highlightSize : 0}
        label={hasHighlight && formatLabel(highlight)}
        labelY={hasHighlight && highlightYPos}
        labelX={maxRadius * 2 + lineLength}
        fillOpacity={fillOpacity}
        fill={highlightColor}
        stroke={highlightColor}
        theme={{
          line: { ...theme.line, ...theme.highlightLine },
          bubble: { ...theme.bubble, ...theme.highlightBubble },
          text: { ...theme.text, ...theme.highlightText },
        }}
        style={{ color: hasHighlight ? undefined : "transparent" }}
      />
      {children}
    </svg>
  );
};

Bubbles.defaultProps = {
  minSize: 8,
  maxSize: 48,
  margin: { top: 1, right: 48, bottom: 1, left: 1 },
  theme: {},
  lineLength: 16,
  formatLabel: (d) => d,
};

Bubbles.propTypes = {
  /** size of the smallest bubble */
  minSize: PropTypes.number,
  /** size of the largest bubble */
  maxSize: PropTypes.number,
  /** margins to apply around the bubble scale */
  margin: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  /** length the line extends outside of the bubble */
  lineLength: PropTypes.number,
  /** formatter function for labels */
  formatLabel: PropTypes.func,
  /** when provided, adds a overlay bubble with the provided value */
  highlight: PropTypes.number,
  /** theme object that passes props to child elements */
  theme: PropTypes.shape({
    bubble: PropTypes.object,
    line: PropTypes.object,
    text: PropTypes.object,
  }),
};

export default Bubbles;
