import React, { useState } from "react";
import { Box, TextField, Button, Paper, Typography, Grid } from "@mui/material";

const WebScraperApp: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [scrapedText, setScrapedText] = useState<string>("");

  const handleScrape = () => {
    // Logic will go here
    console.log("Scraping:", url);
  };

  const handleSummarize = () => {
    // Logic will go here
    console.log("Summarizing scraped text");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-sm p-6 h-full max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Web Scraper</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel */}
          <div className="flex flex-col">
            <h2 className="text-lg font-medium mb-4">Initial Input</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Web Reference
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleScrape}
                  disabled={!url.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  SCRAPE
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Web Page Summary:
              </label>
              <button
                onClick={handleSummarize}
                disabled={!scrapedText}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm"
              >
                SUMMARIZE
              </button>
            </div>

            <div className="flex-1 border border-gray-300 rounded-md p-4 bg-gray-50 overflow-auto">
              <div className="text-sm text-gray-600">
                <div>• Summary point 1</div>
                <div>• Summary point 2</div>
                <div>•</div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col">
            <h2 className="text-lg font-medium mb-4">Web Text Preview</h2>

            <div className="flex-1 border border-gray-300 rounded-md p-4 bg-gray-50 overflow-auto">
              {scrapedText ? (
                <div className="text-sm whitespace-pre-wrap">{scrapedText}</div>
              ) : (
                <div className="text-sm text-gray-500">
                  Scraped content will appear here...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebScraperApp;
