# Stage 1: Use Nginx to serve the site
FROM nginx:alpine

# Copy Nginx config and public assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]