import React, { useMemo } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { getScale } from "./utils";
import Colors from "./Colors";
import Ticks from "./Ticks";
import Marker from "./Marker";
import Bubbles from "./Bubbles";
import Chunks from "./Chunks";
import "./Scale.css";

const DEFAULT_MARGIN = {
  top: 0,
  bottom: 0,
  left: 8,
  right: 8,
};

export const ScaleContext = React.createContext();

export function useScaleContext() {
  const context = React.useContext(ScaleContext);
  if (!context) {
    throw new Error(
      `Scale compound components cannot be rendered outside the Scale component`
    );
  }
  return context;
}

/**
 * Scales are compound components that can consist of one or more of the following children:
 *
 * - `<Scale.Colors />`: renders the scale's colors
 * - `<Scale.Ticks />`: renders an axis to label the scale
 * - `<Scale.Marker />` renders a marker on the scale at a given value
 *
 * ## Example
 *
 * ```jsx
 * <Scale
 *   data=[1, 10, 500, 100]
 *   type="continuous"
 *   width={250}
 *   colors="YlGnBu"
 *   margin={{top: 0, bottom: 0, left: 24, right: 24}}
 * >
 *   <Scale.Marker pointer value={6121}>6,121</Scale.Marker>
 *   <Scale.Colors height={24} />
 *   <Scale.Ticks height={24}  />
 * </Scale>
 * ```
 *
 * See the README.md for more detailed usage.
 */
const Scale = ({
  data,
  colors,
  accessor,
  nice,
  thresholds,
  chunks,
  width,
  type,
  margin = DEFAULT_MARGIN,
  min,
  max,
  categories,
  children,
  className,
  ...props
}) => {
  const options = useMemo(
    () => ({ accessor, thresholds, chunks, nice, min, max, categories }),
    [accessor, thresholds, chunks, nice, min, max, categories]
  );
  /** Value provided by ScaleContext */
  const value = useMemo(() => {
    const scales = getScale(type, { data, colors, ...options });
    const extent = scales?.position?.domain();
    return {
      width,
      type,
      margin,
      colors,
      data,
      thresholds,
      extent,
      chunks,
      ...scales,
    };
  }, [width, colors, thresholds, type, margin, chunks, data, options]);
  return (
    <ScaleContext.Provider value={value}>
      <div className={clsx("HypScale-root", className)} {...props}>
        {children}
      </div>
    </ScaleContext.Provider>
  );
};

Scale.propTypes = {
  /** type of scale to use */
  type: PropTypes.oneOf([
    "category",
    "continuous",
    "quantize",
    "quantile",
    "threshold",
    "bubble",
  ]),
  /** width of the scale */
  width: PropTypes.number,
  /** either an array of colors or a string representing a scale from [d3-scale-chromatic](https://observablehq.com/@d3/color-schemes?collection=@d3/d3-scale-chromatic) */
  colors: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  /** an object containing top, left, bottom, right margins for the scale */
  margin: PropTypes.object,
  /** adjusts the scale to use "nice" values (e.g. 1000 instead of 994) */
  nice: PropTypes.bool,
  /** A set of data values to use for the scale */
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.object])
  ),
  /** A function that selects a data value (used when `data` is an array of objects instead of an array of values) */
  accessor: PropTypes.func,
  /** Contains threshold points when using `threshold` type */
  thresholds: PropTypes.arrayOf(PropTypes.number),
  /** Determines how many groups to split data into for `quantize` and `quantile` scales. */
  chunks: PropTypes.number,
  /** Override the minimum value on the scale */
  min: PropTypes.number,
  /** Override the maximum value on the scale */
  max: PropTypes.number,
};
Scale.Colors = Colors;
Scale.Ticks = Ticks;
Scale.Marker = Marker;
Scale.Bubbles = Bubbles;
Scale.Chunks = Chunks;

export default Scale;
