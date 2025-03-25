
#!/bin/bash
# Simple deployment script for vanilla HTML/JS/CSS app

echo "Creating deployment package..."
mkdir -p dist

# Copy HTML files
cp *.html dist/

# Copy CSS files
mkdir -p dist/css
cp -r css/* dist/css/

# Copy JavaScript files
mkdir -p dist/js
cp -r js/* dist/js/

# Copy any PHP files (for the API)
mkdir -p dist/api
cp -r api/* dist/api/

# Copy .htaccess file
cp .htaccess dist/

# Copy assets if they exist
if [ -d "assets" ]; then
  mkdir -p dist/assets
  cp -r assets/* dist/assets/
fi

# Copy images if they exist
if [ -d "images" ]; then
  mkdir -p dist/images
  cp -r images/* dist/images/
fi

# Create an index.php that redirects to index.html if it doesn't exist
if [ ! -f "index.php" ]; then
  echo "<?php header('Location: index.html'); ?>" > dist/index.php
fi

echo "Application packaged successfully. Files are in the dist directory."
echo ""
echo "Instructions for deployment:"
echo "1. Copy the contents of the dist directory to your web server's root directory"
echo "2. Make sure your web server is configured to handle the .htaccess file"
echo "3. You may need to adjust your server configuration to point to the correct directory"
echo ""
echo "Example NGINX configuration is available in nginx/lovable-app.conf"
