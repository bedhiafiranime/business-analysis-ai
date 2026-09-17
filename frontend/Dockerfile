# Stage 1: Build the Angular application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies deterministically
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Remove the default Nginx configuration and create a new one for SPA routing
RUN rm /etc/nginx/conf.d/default.conf && \
    echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '  listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '  location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '  }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# Copy the Angular build output from the builder stage
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
