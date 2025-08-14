require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://yourdomain.com', // Replace with your actual domain
    'https://*.yourdomain.com' // For subdomains
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https:; "
  );
  
  next();
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Secure API endpoint to get the API key
app.get('/api/config', [
  // Validate and sanitize input
  body('token').optional().trim().escape(),
  
  // Add rate limiting
  apiLimiter,
  
  // Request handler
  (req, res) => {
    try {
      // Check for any validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // In a production app, you might want to add additional security checks here
      // For example, verify a token or check the request origin
      
      // Return the API key (in a real app, you might want to implement proper authentication)
      res.json({
        success: true,
        apiKey: process.env.EXCHANGE_RATE_API_KEY || 'YOUR_API_KEY',
        expiresIn: '1h' // Indicate when the key might expire
      });
    } catch (error) {
      console.error('Error in /api/config:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
]);

// Serve static files with security headers
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, path) => {
    // Add security headers for static files
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      // Cache static assets for 1 year
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send('Something broke!');
});

// Handle 404 - Keep this as the last route
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Universal Converter is running at http://localhost:${port}`);
  console.log('Press Ctrl+C to stop the server');
});
