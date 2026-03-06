# Kubernetes Deployment Reference

This document captures everything a Kubernetes deployment repo needs to know about this application.

---

## Architecture

```
Internet
   │
   ▼
Ingress (nginx / cloud LB)
   ├──► storefront  :8000   (Next.js)
   └──► medusa      :9000   (Medusa API + Admin at /app)
              │
              ├──► PostgreSQL :5432
              └──► Redis      :6379
```

The storefront communicates with Medusa exclusively through its public API — there is no direct database connection from the storefront.

---

## Docker Images

Both images are published to the GitHub Container Registry under `ghcr.io/ekenheim/ecom/`.

| Service | Image | Port |
|---|---|---|
| Medusa backend + admin | `ghcr.io/ekenheim/ecom/medusa` | `9000` |
| Next.js storefront | `ghcr.io/ekenheim/ecom/storefront` | `8000` |

### Tags

Each image is published with three tags on every push to `main`:

- `latest` — always points to the most recent main-branch build
- `<short-sha>` — 7-character git SHA (e.g. `a1b2c3d`) — use this for pinned/production deploys
- `YYYYMMDD-HHmmss` — timestamp tag (e.g. `20260223-143012`)

### CI/CD Triggers

| Workflow | File | Triggers on change to |
|---|---|---|
| Backend | `.github/workflows/docker-backend.yml` | `medusa/**` |
| Storefront | `.github/workflows/docker-storefront.yml` | `storefront/**` |

### Image Pull Secret

Both images are in a private GHCR registry. The k8s cluster needs an `imagePullSecret` in every namespace that deploys these images:

```bash
kubectl create secret docker-registry ghcr-credentials \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<github-pat-with-read:packages-scope> \
  --namespace=<your-namespace>
```

Reference it in every Deployment spec:

```yaml
spec:
  imagePullSecrets:
    - name: ghcr-credentials
```

---

## Infrastructure Dependencies

### PostgreSQL

- Version: 15+
- The backend creates its own schema — no manual schema setup required.
- Migrations are run via a Kubernetes `Job` before each backend `Deployment` rolls out (see [Database Migrations](#database-migrations) below).
- Recommended: use a managed database (RDS, Cloud SQL, etc.) for production. For in-cluster, use the Bitnami PostgreSQL Helm chart.

### Redis

- Version: 7+
- Used by Medusa for: event bus, workflow engine, cache, and distributed locking.
- No persistent data that cannot be reconstructed — a single-node in-cluster Redis is acceptable for most deployments.
- Recommended: Bitnami Redis Helm chart or a managed Redis service.

### Meilisearch

- Version: 1.x+
- Used for product search in the storefront.
- Requires a master key to be set at startup (`MEILI_MASTER_KEY`).
- Recommended: official Meilisearch Helm chart or a managed Meilisearch Cloud instance.
- Expose internally for backend indexing; the storefront queries it directly via `NEXT_PUBLIC_SEARCH_ENDPOINT`.

### S3-compatible Object Storage

- Used by Medusa for media file storage (product images, etc.).
- Can be AWS S3, MinIO, or any S3-compatible endpoint.
- The `S3_ENDPOINT` variable allows a custom endpoint (e.g., for MinIO).

---

## Environment Variables

### Medusa Backend

All variables go into a Kubernetes `Secret` named `medusa-secret` and a `ConfigMap` named `medusa-config`.

#### Secret (`medusa-secret`)

These values are sensitive and must never be stored in plain text in git.

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://user:pass@postgres:5432/medusa` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379` |
| `JWT_SECRET` | Random secret for JWT signing — generate with `openssl rand -hex 32` | — |
| `COOKIE_SECRET` | Random secret for cookie signing — generate with `openssl rand -hex 32` | — |
| `STRIPE_API_KEY` | Stripe secret API key (server-side) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `S3_ACCESS_KEY_ID` | S3 access key ID | — |
| `S3_SECRET_ACCESS_KEY` | S3 secret access key | — |
| `RESEND_API_KEY` | Resend API key for transactional emails | `re_...` |
| `MEILISEARCH_API_KEY` | Meilisearch search API key (from master key) | — |

#### ConfigMap (`medusa-config`)

| Variable | Description | Example |
|---|---|---|
| `STORE_CORS` | Comma-separated allowed origins for the store API | `https://shop.example.com` |
| `ADMIN_CORS` | Comma-separated allowed origins for the admin API | `https://admin.example.com,https://shop.example.com` |
| `AUTH_CORS` | Comma-separated allowed origins for auth endpoints | `https://admin.example.com,https://shop.example.com` |
| `BACKEND_URL` | Public URL of the Medusa backend (used in admin panel links) | `https://admin.example.com` |
| `STOREFRONT_URL` | Public URL of the storefront | `https://shop.example.com` |
| `S3_FILE_URL` | Public base URL for S3 files | `https://my-bucket.s3.eu-west-1.amazonaws.com` |
| `S3_REGION` | S3 region | `eu-west-1` |
| `S3_BUCKET` | S3 bucket name | `medusa-prod` |
| `S3_ENDPOINT` | S3-compatible endpoint (leave blank for AWS) | `https://minio.example.com` |
| `S3_FORCE_PATH_STYLE` | Set to `true` for MinIO/non-AWS S3 | `true` |
| `MEILISEARCH_HOST` | Meilisearch host URL | `http://meilisearch:7700` |
| `RESEND_FROM` | Sender email address for Resend | `"My Store <noreply@example.com>"` |

> **Important:** `STORE_CORS`, `ADMIN_CORS`, and `AUTH_CORS` must include the real public hostname(s) of your storefront and admin panel. Requests from unlisted origins will be rejected with a CORS error.

---

### Next.js Storefront

#### Secret (`storefront-secret`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Medusa publishable API key — create in the Medusa admin under Settings → API Keys |
| `NEXT_PUBLIC_STRIPE_KEY` | Stripe public key (only needed if using Stripe) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client ID (only needed if using PayPal) |
| `NEXT_PUBLIC_SEARCH_API_KEY` | Meilisearch search-only API key |
| `REVALIDATE_SECRET` | Random secret for Next.js on-demand revalidation — generate with `openssl rand -hex 32` |

#### ConfigMap (`storefront-config`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | Internal URL of the Medusa service (cluster-internal) | `http://medusa:9000` |
| `NEXT_PUBLIC_BASE_URL` | Public URL of the storefront | `https://shop.example.com` |
| `NEXT_PUBLIC_DEFAULT_REGION` | Default region ISO-2 code | `us` |
| `NEXT_PUBLIC_FEATURE_SEARCH_ENABLED` | Set to `true` to enable Meilisearch search | `true` |
| `NEXT_PUBLIC_SEARCH_ENDPOINT` | Meilisearch public endpoint | `https://search.example.com` |
| `MEDUSA_CLOUD_S3_HOSTNAME` | S3 hostname for Next.js image optimization (optional) | `my-bucket.s3.eu-west-1.amazonaws.com` |
| `MEDUSA_CLOUD_S3_PATHNAME` | S3 path prefix for image optimization (optional) | `/images/*` |

> **Note on `NEXT_PUBLIC_*` variables:** These are embedded into the JavaScript bundle at build time by Next.js. The Dockerfile passes them in as `ARG` values — the CI workflow can supply them via `build-args` if your public keys need to be baked in. Alternatively, supply them at runtime; the storefront reads them from `process.env` for server-side logic and they will be available there regardless.

---

## Kubernetes Resources

### Recommended resource per service

| Service | CPU request | CPU limit | Memory request | Memory limit |
|---|---|---|---|---|
| medusa | `250m` | `1000m` | `512Mi` | `1Gi` |
| storefront | `100m` | `500m` | `256Mi` | `512Mi` |
| postgres (in-cluster) | `250m` | `1000m` | `512Mi` | `2Gi` |
| redis (in-cluster) | `50m` | `200m` | `128Mi` | `256Mi` |

### Medusa Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: medusa
spec:
  replicas: 1
  selector:
    matchLabels:
      app: medusa
  template:
    metadata:
      labels:
        app: medusa
    spec:
      imagePullSecrets:
        - name: ghcr-credentials
      initContainers:
        - name: wait-for-postgres
          image: busybox:1.36
          command: ['sh', '-c', 'until nc -z postgres 5432; do echo waiting for postgres; sleep 2; done']
        - name: wait-for-redis
          image: busybox:1.36
          command: ['sh', '-c', 'until nc -z redis 6379; do echo waiting for redis; sleep 2; done']
      containers:
        - name: medusa
          image: ghcr.io/ekenheim/ecom/medusa:<tag>
          ports:
            - containerPort: 9000
          envFrom:
            - configMapRef:
                name: medusa-config
            - secretRef:
                name: medusa-secret
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi
          readinessProbe:
            httpGet:
              path: /health
              port: 9000
            initialDelaySeconds: 15
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 9000
            initialDelaySeconds: 30
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: medusa
spec:
  selector:
    app: medusa
  ports:
    - port: 9000
      targetPort: 9000
```

### Storefront Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: storefront
spec:
  replicas: 2
  selector:
    matchLabels:
      app: storefront
  template:
    metadata:
      labels:
        app: storefront
    spec:
      imagePullSecrets:
        - name: ghcr-credentials
      initContainers:
        - name: wait-for-medusa
          image: busybox:1.36
          command: ['sh', '-c', 'until nc -z medusa 9000; do echo waiting for medusa; sleep 2; done']
      containers:
        - name: storefront
          image: ghcr.io/ekenheim/ecom/storefront:<tag>
          ports:
            - containerPort: 8000
          envFrom:
            - configMapRef:
                name: storefront-config
            - secretRef:
                name: storefront-secret
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 8000
            initialDelaySeconds: 20
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: storefront
spec:
  selector:
    app: storefront
  ports:
    - port: 8000
      targetPort: 8000
```

### Ingress (nginx example)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecom-ingress
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - shop.example.com
        - admin.example.com
      secretName: ecom-tls
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: storefront
                port:
                  number: 8000
    - host: admin.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: medusa
                port:
                  number: 9000
```

> The Medusa admin UI is served at `/app` from the backend itself. Point your admin hostname directly at the `medusa` service on port `9000`.

---

## Database Migrations

Before every new backend rollout, run the Medusa migration command as a Kubernetes `Job`. This is safe to run multiple times — Medusa migrations are idempotent.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: medusa-migrate-<short-sha>
spec:
  template:
    spec:
      restartPolicy: OnFailure
      imagePullSecrets:
        - name: ghcr-credentials
      containers:
        - name: migrate
          image: ghcr.io/ekenheim/ecom/medusa:<tag>
          command: ["node", "index.js", "db:migrate"]
          envFrom:
            - configMapRef:
                name: medusa-config
            - secretRef:
                name: medusa-secret
```

Run this Job and wait for it to complete before applying the backend Deployment. Most GitOps tools (Argo CD, Flux) support pre-sync hooks for this.

---

## Startup Order

Services must become healthy in this order:

```
PostgreSQL  ──► Redis  ──► Medusa (+ run migration Job)  ──► Storefront
```

The Deployment manifests above use `initContainers` to enforce TCP reachability checks. The migration Job adds an additional gate before the Medusa Deployment rolls out.

---

## Health Check Endpoints

| Service | Path | Port | Notes |
|---|---|---|---|
| Medusa | `GET /health` | `9000` | Returns `200 OK` when ready |
| Storefront | `GET /` | `8000` | Returns `200 OK` when ready |

---

## Obtaining the Medusa Publishable API Key

The `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is generated inside the running Medusa instance and cannot be known before first boot.

1. Deploy Medusa and PostgreSQL first (storefront can be held back).
2. Open the Medusa Admin at `https://admin.example.com/app`.
3. Create an admin account on first visit.
4. Navigate to **Settings → API Keys**.
5. Create a new publishable key and copy the value.
6. Update the `storefront-secret` Kubernetes Secret with the key:
   ```bash
   kubectl create secret generic storefront-secret \
     --from-literal=NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_... \
     ... \
     --dry-run=client -o yaml | kubectl apply -f -
   ```
7. Restart the storefront Deployment:
   ```bash
   kubectl rollout restart deployment/storefront
   ```

---

## Seeding Initial Data (Optional)

To populate the store with sample products, regions, and shipping options:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: medusa-seed
spec:
  template:
    spec:
      restartPolicy: Never
      imagePullSecrets:
        - name: ghcr-credentials
      containers:
        - name: seed
          image: ghcr.io/ekenheim/ecom/medusa:<tag>
          command: ["node", "index.js", "exec", "scripts/seed.js"]
          envFrom:
            - configMapRef:
                name: medusa-config
            - secretRef:
                name: medusa-secret
```

Run this once after migrations. Do not re-run in production as it inserts duplicate data.

---

## Summary Checklist

- [ ] PostgreSQL instance provisioned and `DATABASE_URL` known
- [ ] Redis instance provisioned and `REDIS_URL` known
- [ ] Meilisearch instance provisioned, master key set, `MEILISEARCH_HOST` and `MEILISEARCH_API_KEY` known
- [ ] S3 bucket created, `S3_*` vars known
- [ ] Resend account set up, `RESEND_API_KEY` and `RESEND_FROM` known
- [ ] `JWT_SECRET` and `COOKIE_SECRET` generated (`openssl rand -hex 32`)
- [ ] `REVALIDATE_SECRET` generated
- [ ] Stripe keys obtained (`STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_KEY`)
- [ ] `ghcr-credentials` imagePullSecret created in the namespace
- [ ] `medusa-secret` and `medusa-config` created
- [ ] Migration Job run and completed successfully
- [ ] Medusa Deployment healthy (`/health` returns 200)
- [ ] Medusa Admin accessed, admin account created
- [ ] Publishable API key created in Medusa Admin
- [ ] `storefront-secret` and `storefront-config` created with publishable key
- [ ] Storefront Deployment healthy
- [ ] Ingress configured with correct hostnames and TLS
- [ ] `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` updated to match ingress hostnames
- [ ] Storefront restarted after CORS update
