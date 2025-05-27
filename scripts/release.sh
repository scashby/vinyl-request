#!/bin/bash
set -e

npm run build
npm run version
git push origin main --follow-tags
