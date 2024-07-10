import { useEffect, useState, useRef, useCallback } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const ResumeViewer = () => {
  const [fileUrl, setFileUrl] = useState("");
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [pageTimes, setPageTimes] = useState({});
  const [totalTime, setTotalTime] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const pdfViewerRef = useRef(null);
  const startTimeRef = useRef(0);
  const intervalRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileUrl(URL.createObjectURL(selectedFile));
    } else {
      setFileUrl(""); // Reset fileUrl when no file is selected
    }
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const handlePageChange = useCallback(({ currentPage }) => {
    const currentTime = Date.now();

    setPageTimes((prevPageTimes) => {
      const actualPage = currentPage + 1;

      if (actualPage === 1) {
        setCurrentPage(actualPage);
        startTimeRef.current = currentTime;
        return prevPageTimes;
      }

      const prevPageTime = prevPageTimes[actualPage - 1] || 0;
      const pageTime = currentTime - startTimeRef.current;

      startTimeRef.current = currentTime;

      return {
        ...prevPageTimes,
        [actualPage - 1]: prevPageTime + pageTime,
      };
    });

    setCurrentPage(currentPage + 1);
  }, []);

  useEffect(() => {
    if (fileUrl) {
      const setPageSize = () => {
        const width = 600;
        const height = 800;
        setPageDimensions({ width, height });
      };

      setPageSize();

      startTimeRef.current = Date.now(); // Start the timer when the file is uploaded

      intervalRef.current = setInterval(() => {
        const currentTime = Date.now();
        const currentPageTime = currentTime - startTimeRef.current;

        const totalTimeSpent = Object.values(pageTimes).reduce(
          (acc, time) => acc + time,
          0
        );

        setTotalTime(totalTimeSpent + currentPageTime);
      }, 1000);
    } else {
      clearInterval(intervalRef.current); // Clear the interval if no file is uploaded
      setTotalTime(0); // Reset total time
    }

    return () => clearInterval(intervalRef.current); // Clear the interval when the component unmounts or file is removed
  }, [fileUrl, pageTimes, currentPage]);

  const formatTime = (time) => {
    if (!time) return "0ms";

    if (time < 1000) {
      return `${time}ms`;
    } else if (time < 60000) {
      const seconds = (time / 1000).toFixed(2);
      return `${seconds}s`;
    } else {
      const minutes = (time / 60000).toFixed(2);
      return `${minutes}min`;
    }
  };

  const handleMouseMove = (event) => {
    const innerPages = pdfViewerRef?.current?.querySelector(
      `[data-testid="core__inner-current-page-${currentPage}"]`
    );
    console.log(currentPage, "Event");

    console.log(innerPages, "Pages");
    if (innerPages) {
      const rect = innerPages.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setMousePosition({ x, y });
      console.log(mousePosition, "Mouse Position");
    }
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          const innerPages = pdfViewerRef?.current?.querySelector(
            `[data-testid="core__inner-current-page-${currentPage}"]`
          );
          if (innerPages) {
            innerPages.addEventListener("mousemove", handleMouseMove);
          }
        }
      });
    });

    const pdfViewer = pdfViewerRef.current;
    if (pdfViewer) {
      observer.observe(pdfViewer, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      const innerPages = pdfViewer?.querySelector(".rpv-default-layout__body");
      if (innerPages) {
        innerPages.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [fileUrl, currentPage, mousePosition]);

  return (
    <div
      style={{
        padding: "20px",
        marginLeft: "1rem",
        display: "flex",
        gap: "20px",
      }}
      className="contain"
    >
      <div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        {fileUrl && (
          <div
            ref={pdfViewerRef}
            style={{
              marginTop: "20px",
              height: "500px",
              width: "600px",
              overflow: "auto",
              position: "relative",
            }}
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
              <Viewer
                fileUrl={fileUrl}
                plugins={[defaultLayoutPluginInstance]}
                onPageChange={handlePageChange}
              />
            </Worker>
          </div>
        )}
      </div>
      <div>
        <div style={{ marginTop: "20px" }}>
          <h2>Page Dimensions:</h2>
          <p>Width: {pageDimensions.width.toFixed(2)}px</p>
          <p>Height: {pageDimensions.height.toFixed(2)}px</p>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h2>Current Page: {currentPage}</h2>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h2>Time Spent on Each Page</h2>
          {Object.keys(pageTimes).map((page) => (
            <p key={page}>
              Page {page}: {formatTime(pageTimes[page])}
            </p>
          ))}
        </div>
        <div style={{ marginTop: "20px" }}>
          <h2>Total Time Spent on PDF: {formatTime(totalTime)}</h2>
        </div>
        <div style={{ marginTop: "20px" }}>
          <h2>Mouse Position</h2>
          <p>X: {mousePosition.x}px</p>
          <p>Y: {mousePosition.y}px</p>
        </div>
      </div>
    </div>
  );
};

export default ResumeViewer;
