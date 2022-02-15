import React, { useEffect, useState } from "react";
import Scale from "./Scales/Scale";

const formatter = (value) =>
  Number.isFinite(value) ? Math.round(value * 100) / 100 : "";

const Label = (props) => {
  return (
    <p
      style={{
        fontSize: "0.75rem",
        position: "absolute",
        top: -36,
      }}
      {...props}
    />
  );
};

const Heading = (props) => {
  return (
    <h2
      style={{
        fontSize: "1.5rem",
        marginBottom: "1.5rem",
      }}
      {...props}
    />
  );
};
// 250 random data points between 0 and 1
const QUANTILE_DATA = Array.from({ length: 250 }, () => Math.random() * 1);

function Demo() {
  const [markValue, setMarkValue] = useState(null);
  const [count, setCount] = useState(0);
  // map mark value from 1 - 5
  const categories = ["a", "b", "c", "d", "e"];
  const categoryIndex = Math.min(4, Math.round(markValue * 5));
  useEffect(() => {
    const timeout = setTimeout(function () {
      setMarkValue(count % 5 === 0 ? null : Math.random());
      setCount(count + 1);
    }, 1000);
    return function () {
      clearTimeout(timeout);
    };
  }, [count]);
  return (
    <div className="App">
      <div>
        <Heading>Ticks</Heading>
        <Scale type="continuous" min={-67} max={24} nice>
          <Scale.Ticks position="top" endTicks tickValues={[0, -25]} />
          <Scale.Ticks ticks={5} />
        </Scale>
      </div>
      <div>
        <Heading>Continuous Scale</Heading>
        <Scale type="continuous" min={0} max={1} colors="Magma">
          <Scale.Marker value={markValue} pointer>
            <Label>{formatter(markValue)}</Label>
          </Scale.Marker>
          <Scale.Colors />
          <Scale.Ticks />
        </Scale>
      </div>

      <div>
        <Heading>Category Scale</Heading>
        <Scale type="category" categories={categories} colors="Cool">
          <Scale.Marker value={markValue && categories[categoryIndex]} pointer>
            <Label>{markValue && categories[categoryIndex]}</Label>
          </Scale.Marker>
          <Scale.Colors />
          <Scale.Ticks tickSizeOuter={0} />
        </Scale>
      </div>
      <div>
        <Heading>Quantize Scale</Heading>
        <Scale type="quantize" chunks={5} min={0} max={1} colors="Spectral">
          <Scale.Marker value={markValue} pointer>
            <Label>{formatter(markValue)}</Label>
          </Scale.Marker>
          <Scale.Colors />
          <Scale.Ticks ticks={5} />
        </Scale>
      </div>
      <div>
        <Heading>Quantile Scale</Heading>
        <Scale
          type="quantile"
          data={QUANTILE_DATA}
          chunks={5}
          min={0}
          max={1}
          colors="OrRd"
        >
          <Scale.Marker value={markValue} pointer>
            <Label>{formatter(markValue)}</Label>
          </Scale.Marker>
          <Scale.Colors />
          <Scale.Ticks tickFormat={formatter} />
        </Scale>
      </div>

      <div>
        <Heading>Threshold Scale</Heading>
        <Scale
          type="threshold"
          thresholds={[0.1, 0.3, 0.6]}
          min={0}
          max={1}
          colors={["#6baed6", "#9ecae1", "#c6dbef", "#deebf7", "#f7fbff"]}
        >
          <Scale.Marker value={markValue} pointer>
            <Label>{formatter(markValue)}</Label>
          </Scale.Marker>
          <Scale.Colors />
          <Scale.Ticks />
        </Scale>
      </div>
      <div>
        <Heading>Bubble Scale</Heading>
        <Scale type="bubble" chunks={3} min={0} max={1} colors="YlGnBu">
          <Scale.Bubbles
            minSize={16}
            maxSize={48}
            fillOpacity={0.7}
            formatLabel={formatter}
            highlight={markValue}
          />
        </Scale>
      </div>
      <div>
        <Heading>Chunks Scale</Heading>
        <Scale type="quantize" chunks={5} min={0} max={1} colors="Spectral">
          <Scale.Chunks />
        </Scale>
      </div>
    </div>
  );
}

export default Demo;
