#!/bin/bash
set -e

EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
BASE_DIR="C:\\Users\\talas\\OneDrive\\Desktop\\sampel 2\\screenshots"
BASE_URL="http://localhost:3100/fa"

mkdir -p screenshots

capture() {
  local filename="$1"
  local path="$2"
  local width="$3"
  local height="$4"
  local output_path="${BASE_DIR}\\${filename}"
  local full_url="${BASE_URL}${path}"

  echo "Capturing ${filename} (${width}x${height}) -> ${full_url}..."
  "$EDGE" --headless=new --disable-gpu \
    --virtual-time-budget=2000 \
    --screenshot="${output_path}" \
    --window-size="${width},${height}" \
    --hide-scrollbars \
    "${full_url}" >/dev/null 2>&1 || true
}

echo "=== Capturing Desktop Screenshots (1440x900) ==="
capture "01_home_desktop.png" "" 1440 900
capture "02_products_catalog_desktop.png" "/products" 1440 900
capture "03_product_detail_corn_desktop.png" "/products/prd_corn_feed" 1440 900
capture "04_product_detail_soybean_desktop.png" "/products/prd_soybean_meal" 1440 900
capture "05_rfq_inquiry_form_desktop.png" "/rfq" 1440 900
capture "06_track_shipment_desktop.png" "/track" 1440 900
capture "07_quality_assays_faq_desktop.png" "/quality" 1440 900
capture "08_about_company_desktop.png" "/about" 1440 900
capture "09_services_logistics_desktop.png" "/services" 1440 900
capture "10_markets_corridors_desktop.png" "/markets" 1440 900
capture "11_contact_offices_desktop.png" "/contact" 1440 900
capture "12_terms_of_trade_desktop.png" "/terms" 1440 900
capture "13_privacy_policy_desktop.png" "/privacy" 1440 900

echo "=== Capturing Mobile Responsive Screenshots (500x1000) ==="
capture "01_home_mobile.png" "" 500 1000
capture "02_products_catalog_mobile.png" "/products" 500 1000
capture "03_product_detail_corn_mobile.png" "/products/prd_corn_feed" 500 1000
capture "05_rfq_inquiry_form_mobile.png" "/rfq" 500 1000
capture "06_track_shipment_mobile.png" "/track" 500 1000
capture "07_quality_mobile.png" "/quality" 500 1000
capture "11_contact_mobile.png" "/contact" 500 1000

echo "=== Screenshot Capture Completed ==="
ls -lh screenshots/*.png

