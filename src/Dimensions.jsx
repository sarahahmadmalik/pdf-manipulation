import React, { useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const ResumeViewer = () => {
  const [fileUrl, setFileUrl] = useState('');
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(1); // State to store the current page number

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const pageLayout = {
    buildPageStyles: ({ numPages, pageIndex }) => {
      return {};
    },
    transformSize: ({ numPages, pageIndex, size }) => {
      const newWidth = size.width;
      const newHeight = size.height;

      // Set page dimensions in state
      setPageDimensions({ width: newWidth, height: newHeight });

      return { width: newWidth, height: newHeight };
    },
  };

  const handlePageChange = ({ currentPage }) => {
    setCurrentPage(currentPage + 1); // Update current page state
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Upload and View Resume</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {fileUrl && (
        <div style={{ marginTop: '20px', height: '750px', overflow: 'auto', position: 'relative' }}>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[defaultLayoutPluginInstance]}
              pageLayout={pageLayout}
              onPageChange={handlePageChange} // Add the onPageChange event
            />
          </Worker>
        </div>
      )}
      <div style={{ marginTop: '20px' }}>
        <h2>Page Dimensions:</h2>
        <p>Width: {pageDimensions.width.toFixed(2)}px</p>
        <p>Height: {pageDimensions.height.toFixed(2)}px</p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Current Page:</h2>
        <p>Page: {currentPage}</p>
      </div>
    </div>
  );
};

export default ResumeViewer;
