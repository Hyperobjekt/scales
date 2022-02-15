import React from "react";
import PropTypes from "prop-types";
import ContinuousColorScale from "./ContinuousColorScale";
import DiscreteColorScale from "./DiscreteColorScale";
import { useScaleContext } from "./Scale";
import { isContinuous } from "./utils";

const Colors = ({ height, ...props }) => {
  const { colors, type, margin, width, chunks } = useScaleContext();
  return isContinuous(type) ? (
    <ContinuousColorScale {...{ colors, margin, width, height }} {...props} />
  ) : (
    <DiscreteColorScale {...{ chunks, margin, height, width }} {...props} />
  );
};

Colors.propTypes = {
  /** height of the color scale */
  height: PropTypes.number,
};

export default Colors;
