// components/DrawMap/ControlPanel.tsx
import * as React from 'react';

function ControlPanel(props: any) {
  let polygonArea = 0;
  for (const polygon of props.polygon) {
    polygonArea += polygon.properties.area;
  }

  return (
    <div className="control-panel">
      <h3>Draw Polygon</h3>
      {polygonArea > 0 && (
        <p>
          {Math.round(polygonArea * 100) / 100} <br />
          square meters
        </p>
      )}
      <div className="source-link">
        <a
          href="https://github.com/visgl/react-map-gl/tree/7.1-release/examples/draw-polygon"
          target="_new"
        >
          View Code ↗
        </a>
      </div>
    </div>
  );
}

export default React.memo(ControlPanel);