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
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { scrapeUrl, ApiError } from "./services/api";
import type { ScrapeResult } from "./services/api";

const WebScraperApp: React.FC = () => {
  const [url, setUrl] = useState<string>("");
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scrapeUrl(url);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScrape();
    }
  };

  const handleSummarize = () => {
    console.log("Summarize functionality will be implemented later");
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 48px)",
        bgcolor: "grey.50",
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={2}
          sx={{
            px: 16,
            py: 2,
            borderRadius: 2,
            minHeight: "calc(100vh - 96px)",
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

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

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
                      onKeyPress={handleKeyPress}
                      placeholder="https://example.com or just example.com"
                      variant="outlined"
                      size="small"
                      sx={{ flex: 1 }}
                      disabled={loading}
                    />
                    <Button
                      onClick={handleScrape}
                      disabled={!url.trim() || loading}
                      variant="contained"
                      size="small"
                      sx={{ fontWeight: "bold", minWidth: 100 }}
                    >
                      {loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "SCRAPE"
                      )}
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
                      disabled={!result}
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
                    {result ? (
                      <Stack spacing={2}>
                        <Typography variant="h6" gutterBottom>
                          {result.title}
                        </Typography>
                        <Stack direction="row" spacing={1} mb={2}>
                          <Chip
                            label={`${result.word_count} words`}
                            size="small"
                            color="primary"
                          />
                          <Chip
                            label={new URL(result.url).hostname}
                            size="small"
                            color="secondary"
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          Summary will appear here after clicking SUMMARIZE
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        • Summary will appear here after scraping content
                        <br />
                        • Key points will be extracted automatically
                        <br />• Click SUMMARIZE after scraping to generate
                      </Typography>
                    )}
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
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      gap: 2,
                    }}
                  >
                    <CircularProgress />
                    <Typography variant="body1" color="text.secondary">
                      Scraping website content...
                    </Typography>
                  </Box>
                ) : result ? (
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "Roboto, sans-serif",
                      lineHeight: 1.6,
                      fontSize: "0.875rem",
                    }}
                  >
                    {result.content}
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
                    Enter a URL and click SCRAPE to view website content here
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
