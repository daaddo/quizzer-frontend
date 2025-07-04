#!/bin/sh

# Replace environment variables in JavaScript files
echo "🔧 Configurazione variabili d'ambiente..."

# Find all JavaScript files in the build directory
find /usr/share/nginx/html -type f -name "*.js" -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; | while read file; do
    echo "📝 Aggiornamento file: $file"
    # Replace placeholder with actual environment variable
    sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL}|g" "$file"
done

echo "✅ Configurazione completata!"
echo "🌐 API Base URL: ${VITE_API_BASE_URL}"

# Execute the original command
exec "$@" 