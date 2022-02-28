import React from "react";
import PropTypes from "prop-types";
import ContinuousColorScale from "./ContinuousColorScale";
import DiscreteColorScale from "./DiscreteColorScale";
import { useScaleContext } from "./Scale";
import { isContinuous } from "./utils";

const Colors = ({ height, ...props }) => {
  const { colors, type, margin, width, chunks, reverse } = useScaleContext();
  return isContinuous(type) ? (
    <ContinuousColorScale {...{ colors, margin, width, height, reverse }} {...props} />
  ) : (
    <DiscreteColorScale {...{ chunks, margin, height, width, reverse }} {...props} />
  );
};

Colors.propTypes = {
  /** height of the color scale */
  height: PropTypes.number,
};

export default Colors;
