import { interpolateRgb, piecewise } from "d3-interpolate";
import * as chromatic from "d3-scale-chromatic";
import { extent, group } from "d3-array";
import { rgb } from "d3-color";
import {
  scaleOrdinal,
  scaleBand,
  scaleLinear,
  scaleQuantile,
  scaleQuantize,
  scaleThreshold,
  scaleSequential,
} from "d3-scale";

/**
 * Returns an array of group values given a selector
 * @param {Array<object>} data
 * @param {function} selector
 * @returns
 */
export const getGroups = (data, selector) => {
  return Array.from(group(data, selector).keys());
};

/**
 * Returns the extent of the provided data, or uses min / max values if provided
 */
export const getExtent = (data, { min, max, accessor = (d) => d }) => {
  // return min / max as extent if they are set
  if (Number.isFinite(min) && Number.isFinite(max)) return [min, max];
  // no data, return min / max or default values
  if (!data || data.length === 0) return [min || 0, max || 1];
  const dataExtent = extent(data, accessor);
  return [min || dataExtent[0], max || dataExtent[1]];
};

const getDomain = ({ data, accessor, min, max }) => {
  if (data && data.length > 0) {
    const [dataMin, dataMax] = extent(data, accessor);
    return [min || dataMin, max || dataMax];
  }
  return [min, max];
};

/**
 * Creates a scale for mapping a domain to colors
 * @param {string} type
 * @param {Array} domain
 * @param {Array} colors
 * @returns
 */
export const getColorScale = (type, domain, colors) => {
  if (!Array.isArray(domain))
    throw new Error("must provide domain for color scale");
  switch (type) {
    case "quantile":
      return scaleQuantile().domain(domain).range(colors);
    case "quantize":
      return scaleQuantize().domain(domain).range(colors);
    case "threshold":
      return scaleThreshold().domain(domain).range(colors);
    case "category":
      return scaleOrdinal().domain(domain).range(colors);
    case "linear":
      return scaleLinear().domain(domain).range(colors);
    case "sequential":
      const interpolator = getColorInterpolator(colors);
      return scaleSequential(interpolator).domain(domain);
    default:
      throw new Error("invalid scale type for color scale");
  }
};

/**
 * Returns a scale for mapping domain to a position
 * @param {string} type
 * @param {Array} domain
 * @param {Array} range
 * @param {object} options
 * @returns
 */
export const getPositionScale = (type, domain, range, options = {}) => {
  if (!Array.isArray(domain) || !Array.isArray(range))
    throw new Error("must provide domain and range for position scale");
  let scale;
  switch (type) {
    case "category":
      scale = scaleBand().domain(domain).range(range);
      break;
    case "quantile":
    case "threshold":
    case "linear":
      scale = scaleLinear().domain(extent(domain)).range(range).clamp(true);
      break;
    default:
      scale = scaleLinear().domain(domain).range(range).clamp(true);
      break;
  }
  return options.nice ? scale.nice() : scale;
};

/**
 * Takes a position scale and a color scale and creates "chunks"
 * that correspond to rectangles for creating a category scale
 * @returns {Array<object>} [{value, x, width, color}]
 */
export const getCategoryChunks = ({ positionScale, colorScale }) => {
  return colorScale.domain().map((d) => ({
    value: d,
    x: positionScale(d),
    width: positionScale.bandwidth(),
    color: colorScale(d),
  }));
};

/**
 * Takes a position scale and a color scale and creates "chunks"
 * that correspond to rectangles for creating discrete color scales
 * @returns {Array<object>} [{value, x, width, color}]
 */
export const getChunks = ({ positionScale, colorScale, reverse }) => {
  const scaleCuts = colorScale.thresholds
    ? colorScale.thresholds()
    : colorScale.quantiles
    ? colorScale.quantiles()
    : colorScale.domain();
  const limits = [
    positionScale.domain()[0],
    ...scaleCuts,
    positionScale.domain()[1],
  ];
  const boxLimits = limits
    .slice(0, limits.length - 1)
    .map((d, j) => [limits[j], limits[j + 1]]);

  return boxLimits.map((l, k) => ({
    value: [l[0], l[1]],
    x: positionScale(l[!!reverse ? 1 : 0]),
    width: Math.abs(positionScale(l[1]) - positionScale(l[0])),
    color: colorScale.range()[k],
  }));
};

/**
 * Gets a color interpolator based on a d3-scale-chromatic color scale
 * string or an array of colors
 * @param {*} value
 * @returns {function}
 */
export const getColorInterpolator = (value) => {
  let interpolate;
  if (Array.isArray(value))
    interpolate = piecewise(interpolateRgb.gamma(2.2), value);
  if (typeof value === "string" && chromatic[`interpolate${value}`])
    interpolate = chromatic[`interpolate${value}`];
  if (!interpolate) throw new Error("cannot create colors");
  return interpolate;
};

/**
 * Takes a d3-scale-chromatic color scale string or an array of colors
 * and maps it to an array where the length corresponds to `numColors`
 * @param {string|Array} value
 * @param {number} numColors
 * @returns {Array<string>} array containing hex formatted strings
 */
export const getColors = (value, numColors) => {
  let interpolate = getColorInterpolator(value);
  const colors = [];
  for (let i = 0; i < numColors; ++i) {
    colors.push(rgb(interpolate(i / (numColors - 1))).formatHex());
  }
  return colors;
};

/**
 * Creates position and color scales along with an array of chunks that represent segments on the scale
 * @param {Object} CategoryScaleConfig - category scale configuration
 * @param {Array<Object>} CategoryScaleConfig.data - a dataset to pull categories from
 * @param {function} CategoryScaleConfig.accessor - accessor function to pull category name from a data record
 * @param {Array<string>} CategoryScaleConfig.categories - an array of predefined categories (instead of using `data` and `accessor`)
 * @param {string|Array<string>} CategoryScaleConfig.colors - (optional) an array of colors or a d3-scale-chromatic color scale string
 * @param {function} CategoryScaleConfig.sorter - (optional) a function to sort the categories
 * @returns {Object} { position, color, chunks }
 */
export const getCategoryScale = ({
  data,
  categories,
  colors = "YlGnBu",
  accessor,
  sorter,
}) => {
  if ((!data || data.length === 0) && !categories)
    throw new Error(
      "must provide data or categories option for category scale"
    );
  categories = categories || getGroups(data, accessor).sort(sorter);
  const scaleColors = getColors(colors, categories.length);
  const positionScale = getPositionScale("category", categories, [0, 1]);
  const colorScale = getColorScale("category", categories, scaleColors);
  return {
    position: positionScale,
    color: colorScale,
    chunks: getCategoryChunks({ positionScale, colorScale }),
  };
};

/**
 * Creates continuous position and color scales.
 * @param {Object} ContinuousScaleConfig - category scale configuration
 * @param {Array<Object>} ContinuousScaleConfig.data - a dataset to pull categories from
 * @param {function} ContinuousScaleConfig.accessor - accessor function to pull category name from a data record
 * @param {string|Array<string>} ContinuousScaleConfig.colors - (optional) an array of colors or a d3-scale-chromatic color scale string
 * @param {number} ContinuousScaleConfig.min - (optional) minimum value for the scale
 * @param {number} ContinuousScaleConfig.max - (optional) maximum value for the scale
 * @param {boolean} ContinuousScaleConfig.nice - (optional) use nice rounded numbers in the scale (default: true)
 * @param {boolean} ContinuousScaleConfig.reverse - (optional) reverse the orientation of the scale (ie max on the left)
 * @returns {Object} { position, color }
 */
export const getContinuousScale = ({
  data,
  colors = "YlGnBu",
  nice,
  accessor,
  min,
  max,
  reverse = false,
}) => {
  const domain = getDomain({ data, accessor, min, max, reverse });
  const range = !!reverse ? [1, 0] : [0, 1];
  const positionScale = getPositionScale("linear", domain, range, {
    nice,
  });
  const colorScale = getColorScale("sequential", domain, colors);
  return {
    position: positionScale,
    color: colorScale,
  };
};

/**
 * Creates continuous position and color scales.
 * @param {Object} QuantileScaleConfig - category scale configuration
 * @param {Array<Object>} QuantileScaleConfig.data - a dataset to pull categories from
 * @param {function} QuantileScaleConfig.accessor - accessor function to pull category name from a data record
 * @param {string|Array<string>} QuantileScaleConfig.colors - (optional) an array of colors or a d3-scale-chromatic color scale string
 * @param {number} QuantileScaleConfig.chunks - (optional) number of quantile "chunks" to use in the scale (default: 5)
 * @param {boolean} QuantileScaleConfig.nice - (optional) use nice rounded numbers in the scale (default: true)
 * @param {boolean} QuantileScaleConfig.reverse - (optional) reverse the orientation of the scale (ie max on the left)
 * @returns {Object} { position, color, chunks }
 */
export const getQuantileScale = ({
  data,
  colors = "YlGnBu",
  chunks = 5,
  nice,
  accessor,
  reverse = false,
}) => {
  if (!data || !data.length)
    throw new Error("no data provided for quantile scale");
  const values = accessor ? data.map(accessor) : data;
  const scaleColors = getColors(colors, chunks);
  const range = !!reverse ? [1, 0] : [0, 1];
  const positionScale = getPositionScale("quantile", values, range, {
    nice,
  });
  const colorScale = getColorScale("quantile", values, scaleColors);
  const quantileScale = scaleQuantile()
    .domain(values)
    .range(new Array(chunks).fill(1).map((v, i) => i));
  return {
    quantile: quantileScale,
    position: positionScale,
    color: colorScale,
    chunks: getChunks({ positionScale, colorScale, reverse }),
  };
};

/**
 * Creates threshold, position and color scales as well as an array of chunks that represent segments on the scale
 * @param {Object} ThresholdScaleConfig - category scale configuration
 * @param {Array<number>} ThresholdScaleConfig.thresholds - an array of threshold values to split the data into
 * @param {Array<Object|number>} ThresholdScaleConfig.data - a dataset to pull categories from
 * @param {function} ThresholdScaleConfig.accessor - accessor function to pull category name from a data record
 * @param {string|Array<string>} ThresholdScaleConfig.colors - (optional) an array of colors or a d3-scale-chromatic color scale string
 * @param {number} ThresholdScaleConfig.min - (optional) minimum value for the scale
 * @param {number} ThresholdScaleConfig.max - (optional) maximum value for the scale
 * @param {boolean} ThresholdScaleConfig.nice - (optional) use nice rounded numbers in the scale (default: true)
 * @param {boolean} ThresholdScaleConfig.reverse - (optional) reverse the orientation of the scale (ie max on the left)
 * @returns {Object} { threshold, position, color, chunks }
 */
export const getThresholdScale = ({
  thresholds,
  data,
  accessor,
  colors = "YlGnBu",
  nice,
  min,
  max,
  reverse = false,
}) => {
  if (!thresholds || !thresholds.length)
    throw new Error("must provide thresholds config array for threshold scale");
  const domain = getDomain({ data, accessor, min, max });
  const scaleColors = getColors(colors, thresholds.length + 1);
  // maps data values to threshold colors
  const colorScale = getColorScale("threshold", thresholds, scaleColors);
  const range = !!reverse ? [1, 0] : [0, 1];
  // maps data values to a position from 0 to 1
  const positionScale = getPositionScale("threshold", domain, range, { nice });
  // maps data values to threshold chunk index
  const thresholdScale = scaleThreshold()
    .domain(thresholds)
    .range(new Array(thresholds.length + 1).fill(1).map((v, i) => i));
  return {
    threshold: thresholdScale,
    position: positionScale,
    color: colorScale,
    chunks: getChunks({ positionScale, colorScale, reverse }),
  };
};

/**
 * Creates continuous position and color scales.
 * @param {Object} QuantizeScaleConfig - category scale configuration
 * @param {Array<Object>} QuantizeScaleConfig.data - a dataset to pull categories from
 * @param {function} QuantizeScaleConfig.accessor - accessor function to pull category name from a data record
 * @param {string|Array<string>} QuantizeScaleConfig.colors - (optional) an array of colors or a d3-scale-chromatic color scale string
 * @param {number} QuantizeScaleConfig.chunks - (optional) number of quantile "chunks" to use in the scale (default: 5)
 * @param {number} QuantizeScaleConfig.min - (optional) minimum value for the scale
 * @param {number} QuantizeScaleConfig.max - (optional) maximum value for the scale
 * @param {boolean} QuantizeScaleConfig.nice - (optional) use nice rounded numbers in the scale (default: true)
 * @param {boolean} QuantizeScaleConfig.reverse - (optional) reverse the orientation of the scale (ie max on the left)
 * @returns {Object} { quantize, position, color, chunks }
 */
export const getQuantizeScale = ({
  data,
  colors = "YlGnBu",
  chunks = 5,
  nice,
  accessor,
  min,
  max,
  reverse = false,
}) => {
  const domain = getDomain({ data, accessor, min, max });
  const scaleColors = getColors(colors, chunks);
  const range = !!reverse ? [1, 0] : [0, 1];
  const positionScale = getPositionScale("quantize", domain, range, {
    nice,
  });
  const colorScale = getColorScale(
    "quantize",
    positionScale.domain(),
    scaleColors
  );
  const quantizeScale = scaleQuantize()
    .domain(positionScale.domain())
    .range(new Array(chunks).fill(1).map((v, i) => i));
  return {
    quantize: quantizeScale,
    position: positionScale,
    color: colorScale,
    chunks: getChunks({ positionScale, colorScale, reverse }),
  };
};

export const getBubbleSizes = (minSize, maxSize, count) => {
  const sizes = [];
  const sizeRange = maxSize - minSize;
  const sizeStep = sizeRange / (count - 1);
  for (let i = 0; i < count; i++) {
    sizes.push(minSize + i * sizeStep);
  }
  return sizes.map((s) => s / 2);
};

export const getBubbleScale = ({
  data,
  colors = "YlGnBu",
  chunks = 5,
  nice,
  accessor,
  min,
  max,
  minSize = 8,
  maxSize = 48,
}) => {
  const domain = getDomain({ data, accessor, min, max });
  const positionScale = getPositionScale("linear", domain, [0, 1], {
    nice,
  });
  const colorScale = getColorScale("sequential", domain, colors);
  const sizeScale = getPositionScale("linear", domain, [minSize, maxSize]);
  return {
    position: positionScale,
    color: colorScale,
    size: sizeScale,
    chunks: getBubbleSizes(minSize, maxSize, chunks),
  };
};

/**
 * Helper function to get scales for the provided scale type and options
 * @param {string} type type of scale (category, quantile, threshold, quantize, continuous)
 * @param {QuantizeScaleConfig|CategoryScaleConfig|ThresholdScaleConfig|QuantileScaleConfig} options options for the scale
 * @returns
 */
export const getScale = (type, options) => {
  switch (type) {
    case "category":
      return getCategoryScale(options);
    case "quantile":
      return getQuantileScale(options);
    case "threshold":
      return getThresholdScale(options);
    case "quantize":
      return getQuantizeScale(options);
    case "continuous":
      return getContinuousScale(options);
    case "bubble":
      return getBubbleScale(options);
    default:
      throw new Error(`unsupported scale type: ${type}`);
  }
};

export const isContinuous = (type) => type === "continuous";
