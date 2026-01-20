#!/bin/bash
BASE_DIR="/Users/ondrej/Desktop/Prace/Webovky/Zakarialegal Strapi/zakarialegal-strapi/src/api"
APIS=("hero" "about" "blog-post" "contact" "faq" "footer" "online-consultation" "service")

for api in "${APIS[@]}"; do
  echo "Generating files for $api..."
  
  # Create directories
  mkdir -p "$BASE_DIR/$api/controllers"
  mkdir -p "$BASE_DIR/$api/services"
  mkdir -p "$BASE_DIR/$api/routes"

  # Controller
  cat <<EOT > "$BASE_DIR/$api/controllers/$api.ts"
/**
 * $api controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::$api.$api');
EOT

  # Service
  cat <<EOT > "$BASE_DIR/$api/services/$api.ts"
/**
 * $api service
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreService('api::$api.$api');
EOT

  # Router
  cat <<EOT > "$BASE_DIR/$api/routes/$api.ts"
/**
 * $api router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::$api.$api');
EOT

done
