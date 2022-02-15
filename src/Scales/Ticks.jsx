import React from "react";
import PropTypes from "prop-types";
import { select } from "d3-selection";
import { axisBottom, axisTop } from "d3-axis";
import { format } from "d3-format";
import { useScaleContext } from "./Scale";
import clsx from "clsx";

/**
 * Presentation component to render a d3 axis to display ticks.
 */
export const ScaleTicks = ({
  position = "bottom",
  width = 200,
  height = 24,
  scale,
  ticks,
  tickArguments,
  tickFormat,
  tickValues,
  tickSize,
  tickSizeInner,
  tickSizeOuter,
  tickPadding,
  endTicks,
  margin = { left: 0, right: 0 },
  className,
  ...props
}) => {
  // adjust the scale for the inner width
  const innerWidth = width - (margin.left + margin.right);
  const scaleRange = [1, innerWidth - 1];
  const innerScale = scale.copy().range(scaleRange); // copy to avoid mutating the original scale

  // supports top or bottom aligned ticks
  let axisCreator =
    position === "bottom" ? axisBottom(innerScale) : axisTop(innerScale);

  // set the d3-axis properties
  if (tickFormat) {
    let formatFunc =
      typeof tickFormat === "string" ? format(tickFormat) : tickFormat;
    axisCreator = axisCreator.tickFormat(formatFunc);
  }
  if (Number.isFinite(ticks)) axisCreator = axisCreator.ticks(ticks);
  if (tickArguments) axisCreator = axisCreator.tickArguments(tickArguments);
  if (tickValues) axisCreator = axisCreator.tickValues(tickValues);
  if (Number.isFinite(tickSize)) axisCreator.tickSize(tickSize);
  if (Number.isFinite(tickSizeInner)) axisCreator.tickSizeInner(tickSizeInner);
  if (Number.isFinite(tickSizeOuter)) axisCreator.tickSizeOuter(tickSizeOuter);
  if (Number.isFinite(tickPadding)) axisCreator.tickPadding(tickPadding);
  const tickOverrides = tickValues || [];
  if (endTicks) axisCreator.tickValues([...scale.domain(), ...tickOverrides]);

  // calls the axis renderer when the dom reference is provided
  const axisRef = (axis) => {
    axis && axisCreator(select(axis));
  };

  return (
    <svg
      className={clsx("HypScale-ticks", className)}
      width={width}
      viewBox={[0, 0, width, height]}
      {...props}
    >
      <g
        transform={`translate(${margin.left} ${
          position === "bottom" ? 1 : height - 1
        })`}
        ref={axisRef}
      ></g>
    </svg>
  );
};

ScaleTicks.propTypes = {
  scale: PropTypes.any,
  position: PropTypes.oneOf(["bottom", "top"]),
  width: PropTypes.number,
  height: PropTypes.number,
  ticks: PropTypes.number,
  tickArguments: PropTypes.array,
  tickFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  tickValues: PropTypes.array,
  tickSize: PropTypes.number,
  tickSizeInner: PropTypes.number,
  tickSizeOuter: PropTypes.number,
  tickPadding: PropTypes.number,
  margin: PropTypes.object,
  className: PropTypes.string,
};

/** Tick component connected to the scale context */
export default function Ticks(props) {
  const {
    width,
    position: scale,
    margin,
    type,
    chunks,
    thresholds,
  } = useScaleContext();
  let tickValues;

  // quantile and quantize have fixes tick values
  if (type === "quantile" || type === "quantize")
    tickValues = [...chunks.map((c) => scale.invert(c.x)), scale.domain()[1]];

  // threshold has fixed tick values at provided thresholds
  if (type === "threshold")
    tickValues = [scale.domain()[0], ...thresholds, scale.domain()[1]];

  return <ScaleTicks {...{ width, scale, margin, tickValues }} {...props} />;
}

Ticks.propTypes = ScaleTicks.propTypes;
