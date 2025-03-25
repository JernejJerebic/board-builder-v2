
#!/bin/bash
# Simple deployment script for React Vite app

echo "Building application..."
npm run build

echo "Application built successfully. Files are in the dist directory."
echo ""
echo "Instructions for NGINX deployment:"
echo "1. Copy the contents of the dist directory to your web server's root directory"
echo "2. Make sure your NGINX is configured to handle client-side routing"
echo "3. You may need to adjust your NGINX configuration to point to the correct directory"
echo ""
echo "Example NGINX configuration is available in nginx/lovable-app.conf"
