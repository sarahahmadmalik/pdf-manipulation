/* eslint-disable react/prop-types */
import { useEffect } from "react";
import Heatmap from "visual-heatmap";

function PDFViewer({ mouseData }) {
  useEffect(() => {
    const initializeHeatmap = () => {
      const heatmapInstance = new Heatmap(".heatmap-container", {
        size: 50.0,
        max: 100,
        min: 0,
        intensity: 1.0,
        opacity: 0.4,
        backgroundImage: {
          url: "/img.png",
        },
        gradient: [
          { color: [0, 255, 0, 1.0], offset: 0.45 },
          { color: [255, 255, 0, 1.0], offset: 0.85 },
          { color: [255, 0, 0, 1.0], offset: 1.0 },
        ],
      });

      const heatmapData = mouseData.map(({ x, y, time }) => ({
        x,
        y,
        value: calculateIntensity(time),
      }));

      heatmapInstance.renderData(heatmapData);
    };
    initializeHeatmap();
  }, [mouseData]);

  //for now its random because iam not able to understand how to calculate intensity
  const calculateIntensity = (hoverTime) => {
    const currentTime = Date.now();
    const hoverDuration = currentTime - hoverTime;
    return Math.min(hoverDuration, 100);
  };

  return (
    <div className="hello" style={{ position: "relative" }}>
      <div
        className="heatmap-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default PDFViewer;
