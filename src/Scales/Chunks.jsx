import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { useScaleContext } from ".";

const FORMAT_RANGE = (value, entryIndex, total) => {
  if (!Array.isArray(value)) return value;
  if (entryIndex === 0) return `< ${value[1]}`;
  if (entryIndex === total - 1) return `> ${value[0]}`;
  if (Array.isArray(value) && value.length === 2)
    return `${value[0]} - ${value[1]}`;
  return value;
};

/**
 * Renders a collection of bubbles with annotations
 */
const Chunks = ({ formatLabel, className, ...props }) => {
  const { chunks } = useScaleContext();
  if (!chunks) return null;
  return (
    <ul className={clsx("HypScale-chunkList", className)} {...props}>
      {chunks.map((chunk, i) => {
        return (
          <li key={i} className="HypScale-chunkListItem">
            <span
              className="HypScale-chunkMarker"
              aria-hidden="true"
              style={{ background: chunk.color }}
            />
            <span className="HypScale-chunkLabel">
              {formatLabel(chunk.value, i, chunks.length)}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

Chunks.defaultProps = {
  formatLabel: FORMAT_RANGE,
};

Chunks.propTypes = {
  formatLabel: PropTypes.func,
};

export default Chunks;
