const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic health/status endpoint.
// This backend is a placeholder: EPIC 00 does not define runtime HTTP APIs.
// Repository structure and Blazor app behavior are managed directly in the repo.
app.get('/', (req, res) => {
  res.json({
    name: 'EPIC 00: Repo Retrofit Backend',
    status: 'ok',
    message:
      'Placeholder backend for EPIC 00. No functional APIs are required by the epic; repo structure and Blazor app live outside this service.'
  });
});

// 404 handler for any undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  // Simple startup log to stdout
  // (In practice, primary logs for the epic are kept under /logs in the repo.)
  console.log(`EPIC 00 placeholder backend listening on port ${PORT}`);
});
