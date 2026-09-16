# Monolith: Vite frontend + Express API. Build from repo root

# --- Stage 1: Build the SPA (Vite) ---
# Produces static HTML, CSS, and JS files in /dist - copied into the final image as ./public.
FROM node:22-bookworm AS frontend-build
WORKDIR /app/frontend
COPY frontend/ ./
#Empty = browser calls /api on the same host as the page (same domain as Express).
ENV VITE_API_URL=
# Public Clerk key (sage to pass as build-arg; it is embedded in client JS anyway)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm install --no-audit --no-fund \
    && npm run build

# --- Stage 2: compile the API (TypeScript => JavaScript) ---
# Produces dist/ with index.js and the rest of the server bundle.
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app
COPY backend/ ./
RUN npm install --no-audit --no-fund \
    && npm run build

# --- Stage 3: runtime image (only prod deps + built assests) ---
# Express server API routes and static files from public/ (Vite build output from stage 1).
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]