# Séance Frontend - Deployment Guide

This guide covers deploying the Séance frontend application to various environments.

---

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Docker](#docker)
  - [Manual/VPS](#manualvps)
  - [AWS/GCP/Azure](#awsgcpazure)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Rollback](#rollback)

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass locally
- [ ] Production build works: `npm run build && npm run start`
- [ ] Environment variables documented
- [ ] Backend API is deployed and accessible
- [ ] WebSocket endpoint is accessible (wss:// in production)
- [ ] CORS configured on backend for frontend domain
- [ ] SSL/TLS certificates ready (for HTTPS)
- [ ] DNS records configured
- [ ] Error tracking set up (optional: Sentry, LogRocket)

---

## Environment Configuration

### Production Environment Variables

Create a `.env.production` or configure in your hosting platform:

```bash
# API Configuration (REQUIRED)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_INPUT=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
```

**Important Notes:**
- Use `https://` for API URL in production
- Use `wss://` (secure WebSocket) for WS_URL in production
- Never commit `.env.production` to git
- WebSocket URL may be same domain as API or separate

---

## Deployment Options

### Vercel (Recommended)

**Best for:** Easy deployment, automatic HTTPS, global CDN

#### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

4. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all `NEXT_PUBLIC_*` variables
   - Redeploy after adding variables

5. **Custom Domain** (optional):
   - Project Settings → Domains
   - Add your domain
   - Configure DNS (Vercel provides instructions)

#### Vercel Configuration

Create `vercel.json` (optional):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Pros:**
- ✅ Automatic deployments from Git
- ✅ Preview deployments for PRs
- ✅ Built-in analytics
- ✅ Global CDN
- ✅ Automatic HTTPS

**Cons:**
- ⚠️ Function execution time limits (hobby plan)
- ⚠️ Vendor lock-in

---

### Docker

**Best for:** Self-hosted, consistent environments, Kubernetes

#### Dockerfile

Create `Dockerfile` in frontend directory:

```dockerfile
# syntax=docker/dockerfile:1

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Build and Run

```bash
# Build image
docker build -t seance-frontend:latest .

# Run container
docker run -d \\
  -p 3000:3000 \\
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \\
  -e NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com \\
  -e NEXT_PUBLIC_ENVIRONMENT=production \\
  --name seance-frontend \\
  seance-frontend:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
      - NEXT_PUBLIC_ENVIRONMENT=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with:
```bash
docker-compose up -d
```

**Pros:**
- ✅ Consistent environments
- ✅ Easy scaling
- ✅ Works with Kubernetes
- ✅ Self-hosted

**Cons:**
- ⚠️ Requires Docker knowledge
- ⚠️ More infrastructure management

---

### Manual/VPS

**Best for:** Full control, custom infrastructure

#### Steps:

1. **SSH into server**:
   ```bash
   ssh user@your-server.com
   ```

2. **Install Node.js** (if not installed):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone repository**:
   ```bash
   git clone <your-repo-url>
   cd seance/frontend
   ```

4. **Install dependencies**:
   ```bash
   npm ci --only=production
   ```

5. **Build application**:
   ```bash
   npm run build
   ```

6. **Set environment variables**:
   ```bash
   export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   export NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
   export NEXT_PUBLIC_ENVIRONMENT=production
   ```

7. **Start with PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start npm --name "seance-frontend" -- start
   pm2 save
   pm2 startup
   ```

#### Nginx Reverse Proxy

Create `/etc/nginx/sites-available/seance-frontend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/seance-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Pros:**
- ✅ Full control
- ✅ No vendor lock-in
- ✅ Cost-effective

**Cons:**
- ⚠️ Manual scaling
- ⚠️ More maintenance

---

### AWS/GCP/Azure

**Best for:** Enterprise, auto-scaling, managed infrastructure

#### AWS (Amplify or ECS)

**Option 1: AWS Amplify** (easiest)
1. Go to AWS Amplify Console
2. Connect Git repository
3. Configure build settings (auto-detected for Next.js)
4. Set environment variables
5. Deploy

**Option 2: ECS with Fargate**
1. Push Docker image to ECR
2. Create ECS cluster
3. Define task with container image
4. Configure load balancer
5. Set auto-scaling policies

#### GCP (Cloud Run or App Engine)

**Option 1: Cloud Run**
```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/seance-frontend

# Deploy
gcloud run deploy seance-frontend \\
  --image gcr.io/PROJECT_ID/seance-frontend \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars "NEXT_PUBLIC_API_URL=https://api.yourdomain.com,NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com"
```

#### Azure (App Service or Container Instances)

Use Azure Portal or CLI to deploy Docker container or Node.js app.

---

## Post-Deployment

### Verification Checklist

After deployment, verify:

- [ ] Website loads at production URL
- [ ] Can create a session
- [ ] Can join a session
- [ ] WebSocket connects (check connection status)
- [ ] Can send messages
- [ ] Spirit responds with planchette animation
- [ ] Responsive on mobile devices
- [ ] HTTPS certificate valid
- [ ] No console errors
- [ ] Reconnection works after disconnecting

### Testing

1. **Functional Test**:
   - Create session
   - Open in incognito/another browser
   - Join session
   - Send messages
   - Verify real-time sync

2. **Performance Test**:
   - Run Lighthouse audit
   - Check Performance score > 90
   - Verify animation at 60fps

3. **Cross-Browser**:
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome)

---

## Monitoring

### Application Monitoring

**Recommended Tools:**
- **Vercel Analytics** (if using Vercel)
- **Google Analytics** (set `NEXT_PUBLIC_ENABLE_ANALYTICS=true`)
- **Sentry** for error tracking
- **LogRocket** for session replay

### Health Check Endpoint

Next.js doesn't have a built-in health endpoint, but you can add one:

Create `app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

Access at: `https://yourdomain.com/api/health`

### Metrics to Monitor

- **Uptime**: Server availability
- **Response Time**: Page load speed
- **Error Rate**: 4xx/5xx errors
- **WebSocket Connection**: Success rate
- **User Sessions**: Active sessions
- **Build Status**: Deployment success/failure

---

## Rollback

### Vercel Rollback

1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"

### Docker Rollback

```bash
# List images
docker images

# Run previous version
docker run -d -p 3000:3000 seance-frontend:previous-tag
```

### Manual Rollback

```bash
# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild
npm run build

# Restart PM2
pm2 restart seance-frontend
```

---

## Troubleshooting Deployment Issues

### Build Fails

**Error**: `Build failed with exit code 1`

**Solutions**:
- Check `npm run build` locally
- Ensure all dependencies in `package.json`
- Check Node.js version (should be 20+)
- Review build logs for specific errors

### WebSocket Connection Fails in Production

**Error**: Connection status shows "Disconnected"

**Solutions**:
- Verify backend WebSocket endpoint is accessible
- Use `wss://` (secure WebSocket) in production
- Check firewall/security groups allow WebSocket connections
- Verify CORS headers on backend
- Check reverse proxy WebSocket support (nginx: `proxy_set_header Upgrade`)

### Environment Variables Not Working

**Error**: API calls go to localhost

**Solutions**:
- Ensure variables start with `NEXT_PUBLIC_`
- Rebuild after adding environment variables
- Check hosting platform's environment variable settings
- Variables are embedded at build time (not runtime for client-side)

---

## Security Considerations

- ✅ Use HTTPS (SSL/TLS certificates)
- ✅ Use secure WebSocket (wss://)
- ✅ Set proper CORS on backend
- ✅ Don't expose sensitive keys in `NEXT_PUBLIC_*` variables
- ✅ Keep dependencies updated: `npm audit`
- ✅ Enable Content Security Policy (CSP) headers
- ✅ Use environment variables for all config

---

## Scaling

### Horizontal Scaling

- Use load balancer (ALB, nginx, Cloudflare)
- Run multiple instances
- Ensure sticky sessions for WebSocket if needed

### CDN

- Next.js static assets are CDN-friendly
- Use Vercel's global edge network
- Or configure CloudFront/Fastly

### Performance Tips

- Enable compression (gzip/brotli)
- Set proper cache headers
- Use HTTP/2
- Optimize images (Next.js Image component)
- Monitor Core Web Vitals

---

## Next Steps

After deployment:
1. Set up continuous deployment (CI/CD)
2. Configure monitoring and alerts
3. Set up automated backups
4. Document runbooks for incidents
5. Plan for disaster recovery

---

**Happy Deploying! 🚀**

For questions or issues, refer to the main README or open an issue on GitHub.
