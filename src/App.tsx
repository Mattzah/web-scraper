import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Stack,
  Divider,
} from "@mui/material";

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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            minHeight: "calc(100vh - 48px)",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Web Scraper
          </Typography>

          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={4}
            sx={{ height: "calc(100vh - 200px)" }}
          >
            {/* Left Panel */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: { xs: "100%", lg: "50%" },
              }}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                Input & Summary
              </Typography>

              <Stack spacing={3} sx={{ flex: 1 }}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    color="text.secondary"
                  >
                    Website URL
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      fullWidth
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      variant="outlined"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      onClick={handleScrape}
                      disabled={!url.trim()}
                      variant="contained"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    >
                      SCRAPE
                    </Button>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Page Summary
                    </Typography>
                    <Button
                      onClick={handleSummarize}
                      disabled={!scrapedText}
                      variant="contained"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    >
                      SUMMARIZE
                    </Button>
                  </Stack>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      bgcolor: "grey.25",
                      flex: 1,
                      minHeight: 250,
                      overflow: "auto",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      • Summary will appear here after scraping and summarizing
                      content
                      <br />
                      • Key points will be extracted automatically
                      <br />• Click SUMMARIZE after scraping to generate
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </Box>

            {/* Right Panel */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: { xs: "100%", lg: "50%" },
              }}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                Scraped Content
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  p: 3,
                  bgcolor: "grey.25",
                  overflow: "auto",
                  minHeight: 400,
                }}
              >
                {scrapedText ? (
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "Roboto Mono, monospace",
                      lineHeight: 1.6,
                    }}
                  >
                    {scrapedText}
                  </Typography>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      fontStyle: "italic",
                      textAlign: "center",
                      mt: 10,
                    }}
                  >
                    Enter a URL and click SCRAPE to view the website content
                    here
                  </Typography>
                )}
              </Paper>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default WebScraperApp;
