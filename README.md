# @hyperobjekt/scales

![2022-02-15 15 18 51](https://user-images.githubusercontent.com/21034/154166265-3b2e4137-268f-4a6e-8a90-31aa971ed489.gif)

This package consists of react components for creating data scales that can be used for data readouts or legends.

It allows for several different types of scales, including:

- ticks
- continuous scales
- category scales
- quantile scales
- quantize scales
- threshold scales
- bubble scales

Each scale consists of a wrapper component with one or more child components.

- `<Scale.Colors />`: renders the scale's colors
- `<Scale.Ticks />`: renders an axis to label the scale
- `<Scale.Marker />` renders a marker on the scale at a given value
- `<Scale.Bubbles />` renders bubbles for the scale config
- `<Scale.Chunks />`: renders a vertical list of ranges in the scale

## Demo

- [codesandbox](https://codesandbox.io/s/hyperobjekt-scales-3wzh8e)

## Usage

Install the package with:

```
npm i @hyperobjekt/scales
```

or

```
yarn add @hyperobjekt/scales
```

Import the required components and the base CSS styles:

```jsx
import Scale from "@hyperobjekt/scales";
import "@hyperobjekt/scales/dist/style.css";
```

Assemble the scale parts as desired:

```jsx
<Scale type="continuous" min={0} max={100} colors="YlGnBu">
  <Scale.Colors />
  <Scale.Ticks />
  <Scale.Marker value={33} pointer />
</Scale>
```

## Component API

### `<Scale />`

The parent component that contains the scale configuration.

**Props**

- `type`: determines which type of scale to use ("category", "continuous", "quantize", "quantile", "threshold", "bubble")
- `width`: determines the width of the scale
- `colors`: either an array of colors or a string representing a scale from [d3-scale-chromatic](https://observablehq.com/@d3/color-schemes?collection=@d3/d3-scale-chromatic)
- `margin`: an object containing top, left, bottom, right margins for the scale
- `nice`: adjusts the scale to use "nice" values (e.g. 1000 instead of 994) (default: false)
- `data`: A set of data values to use for the scale
- `accessor`: A function that selects a data value (used when `data` is an array of objects instead of an array of values)
- `thresholds`: Contains threshold points when using `threshold` scale type
- `chunks`: Determines how many groups to split data into for `quantize` and `quantile` scales.
- `min`: Minimum value for the scale
- `max`: Maximum value for the scale

### `<Scale.Colors />`

Renders a color scale for the given data and scale type.

**Props**

- `height`: height of the color scale

### `<Scale.Ticks />`

Renders tick labels for the given data and scale type.

**Props**

- `ticks`: the target number of ticks to show on the scale (continuous)
- `tickFormat`: a formatter function for ticks on the scale
- `tickValues`: used to explicitly specify where to render ticks on the scale
- `tickSize`: size of the ticks on the scale
- `tickSizeInner`: size of the inner ticks on the scale
- `tickSizeOuter`: size of the outer ticks on the scale
- `tickPadding`: padding space between ticks
- `endTicks`: forces the min and max ticks to show on the scale (overrides `ticks` props)

### `<Scale.Marker />`

Renders a marker with optional label at a given location on the scale.

**Props**

- `value`: determines which point on the scale has the marker
- `pointer`: when true, renders a pointer on the scale at the value
- `renderPointer`: a function that takes {color, position, value} and returns JSX to render the pointer
- `color`: overrides the pointer color (uses value color by default)

### `<Scale.Bubbles />`

Renders bubbles with optional value marker

**Props**

- `minSize`: smallest bubble size
- `maxSize`: largest bubble size
- `count`: number of bubbles to show (overrides `chunks` value on parent scale)
- `margin`: margin for the bubbles scale ({top, bottom, left, right })
- `lineLength`: sets the line length between the bubble and the label
- `formatLabel`: function that formats bubble labels
- `theme`: object containing override properties for styling the bubble, line, and text (e.g. {bubble: {fill:"red", strokeWidth: 5} })
- `fillOpacity`: sets the fill opacity on bubbles

### `<Scale.Chunks />`

Renders a vertical list of scale chunks with colors and value ranges.

> TODO: add ability to hightlight a chunk

**Props**

- `formatLabel`: function that takes the chunk value, index, and total chunks and returns a string.

## Context

### `useScaleContext()`

You can use the `useScaleContext()` hook provided by this package to create your own child components. The scale context provides the following:

- `width`: width of the scale
- `margin`: margins for the scale
- `data`: data for the scale
- `position`: a scale for mapping values to position on the scale
- `color`: a scale for mapping values to colors
- `chunks`: objects containing data for "chunks" on discrete scales (not available on continuous scales)
- `extent`: an array with the [min, max] of the position / color scale

## Utility Functions

The following utility functions are provided by this package:

### `getScale(type, {data, accessor, min, max, thresholds, chunks })`

Returns all relevant scales for the given `type` and config object.

### `getColors(value, numColors)`

This function will return an array of hex color strings based on the provided `value` parameter.

**Parameters**

- `value`: either a string containing a scale name from [d3-scale-chromatic](https://observablehq.com/@d3/color-schemes) (e.g. "YlGnBu") or an array of color strings (e.g. ["#f00", "#0f0", "#00f"])
- `numColors`: the number of colors to return

### `getColorScale(type, domain, colors)`

Returns a color scale that maps a data domain to a color string.

- `type`: a string representing scale type ("category", "quantile", "quantize", "threshold", "linear", or "sequential")
- `domain`: the data domain for the scale
- `colors`: either a string containing a scale name from [d3-scale-chromatic](https://observablehq.com/@d3/color-schemes) (e.g. "YlGnBu") or an array of color strings (e.g. ["#f00", "#0f0", "#00f"]) that will be used to map domain values to

### `getPositionScale(type, domain, range, options)`

Returns a scale that maps a data domain to a pixel value range.

- `type`: a string representing scale type ("category", "quantile", "threshold", or "linear")
- `domain`: the data domain for the scale
- `range`: the range of pixel values to map to
- `options`: options for the scale
  - `nice`: when true, the domain is adjusted to have [nice values](https://github.com/d3/d3-scale#continuous_nice)


