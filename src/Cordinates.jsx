import { useEffect, useState, useRef } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

const PDFViewer = () => {
  const [file, setFile] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pdfViewerRef = useRef(null);
  const secondViewerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selections, setSelections] = useState([]);
  console.log(selections);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      setFile(fileURL);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const innerPages = pdfViewerRef.current?.querySelector(
        `[data-testid="core__inner-current-page-${currentPage - 1}"]`
      );
      if (innerPages) {
        const pageRect = innerPages.getBoundingClientRect();
        const x = rect.left - pageRect.left;
        const y = rect.top - pageRect.top;
        const width = rect.width;
        const height = rect.height;
        const newSelection = {
          x,
          y,
          width,
          height,
          page: currentPage - 1,
          clickCount: 1, // Initialize click count
        };

        setSelections((prevSelections) => {
          const existingIndex = prevSelections.findIndex(
            (sel) =>
              sel.x === newSelection.x &&
              sel.y === newSelection.y &&
              sel.page === newSelection.page
          );

          if (existingIndex !== -1) {
            // Increment click count if selection already exists
            const updatedSelections = [...prevSelections];
            updatedSelections[existingIndex].clickCount += 1;
            return updatedSelections;
          } else {
            // Add new selection
            return [...prevSelections, newSelection];
          }
        });
      }
    }
  };

  const handlePageChange = ({ currentPage }) => {
    setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    const pdfViewer = pdfViewerRef.current;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          const innerPages = pdfViewer?.querySelector(
            `[data-testid="core__inner-current-page-${currentPage - 1}"]`
          );
          if (innerPages) {
            innerPages.addEventListener("mouseup", handleTextSelection);
          }
        }
      });
    });

    if (pdfViewer) {
      observer.observe(pdfViewer, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      const innerPages = pdfViewer?.querySelector(
        `[data-testid="core__inner-current-page-${currentPage - 1}"]`
      );
      if (innerPages) {
        innerPages.removeEventListener("mouseup", handleTextSelection);
      }
    };
  }, [file, currentPage]);

  useEffect(() => {
    const secondViewer = secondViewerRef.current;

    const highlightSelection = (selection) => {
      const innerPages = secondViewer?.querySelector(
        `[data-testid="core__inner-current-page-${selection.page}"]`
      );
      if (innerPages) {
        const highlight = document.createElement("div");
        highlight.className = "highlight";
        highlight.style.position = "absolute";
        highlight.style.left = `${selection.x}px`;
        highlight.style.top = `${selection.y}px`;
        highlight.style.width = `${selection.width}px`;
        highlight.style.height = `${selection.height}px`;
        const opacity = Math.min(selection.clickCount / 10, 1); // Adjust opacity based on click count
        highlight.style.backgroundColor = `rgba(255, 0, 0, ${opacity})`;
        innerPages.appendChild(highlight);
      }
    };

    selections.forEach((selection) => {
      highlightSelection(selection);
    });
  }, [selections, currentPage]);

  return (
    <div className="flex justify-center" style={{ width: "100%" }}>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && (
        <div style={{ display: "flex", width: "100%" }}>
          <div
            ref={pdfViewerRef}
            style={{
              width: "600px",
              height: "500px",
              marginRight: "30px",
              position: "relative",
              overflow: "auto",
            }}
          >
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js`}
            >
              <Viewer
                fileUrl={file}
                plugins={[defaultLayoutPluginInstance]}
                onPageChange={handlePageChange}
              />
            </Worker>
          </div>
          <div
            ref={secondViewerRef}
            style={{
              width: "600px",
              height: "500px",
              marginLeft: "30px",
              position: "relative",
              overflow: "auto",
            }}
          >
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js`}
            >
              <Viewer
                fileUrl={file}
                plugins={[defaultLayoutPluginInstance]}
                onPageChange={handlePageChange}
              />
            </Worker>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
