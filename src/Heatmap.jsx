import React, { useEffect, useRef } from 'react';
import h337 from 'heatmap.js';

const Heatmap = ({ data }) => {
  const heatmapRef = useRef(null);
  const heatmapInstance = useRef(null);

  useEffect(() => {
    const container = heatmapRef.current;
    
    // Configuration object for the heatmap
    const config = {
      container,
      radius: 10,
      maxOpacity: 0.5,
      minOpacity: 0,
      blur: 0.75
    };
    
    // Create heatmap instance
    heatmapInstance.current = h337.create(config);

    // Add data to the heatmap instance
    var dataPoint = {
      x: 5, // x coordinate of the datapoint, a number
      y: 5, // y coordinate of the datapoint, a number
      value: 100 // the value at datapoint(x, y)
    };
    heatmapInstance.current.addData(dataPoint);
  

    return () => {
      // Clean up if needed
      heatmapInstance.current = null;
    };
  }, [data]);

  return (
    <div
      ref={heatmapRef}
      style={{ width: '1200px', height: '1800px', position: 'relative' }}
    ></div>
  );
};

export default Heatmap;
