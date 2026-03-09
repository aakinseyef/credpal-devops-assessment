# Plan: Push to GitHub and Test

## Overview
This project has a CI/CD pipeline already configured in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) but no Git repository exists yet. This plan covers initializing Git, creating a GitHub repo, and running tests.

## Steps to Push to GitHub

### 1. Initialize Local Git Repository
```bash
git init
```

### 2. Create .gitignore File
Create a `.gitignore` to exclude:
- `node_modules/` - npm dependencies
- `.env` - environment variables
- `*.tfstate*` - Terraform state files
- `.terraform/` - Terraform working directory
- `terraform.tfvars` - contains sensitive values

### 3. Stage and Commit
```bash
git add .
git commit -m "Initial commit"
```

### 4. Create GitHub Repository
Go to https://github.com/new and create a new repository (do NOT initialize with README - we already have files)

### 5. Add Remote and Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Testing Options

### Option A: Test Locally
```bash
cd app
npm install
npm test
```
This runs Jest tests defined in [`app/test/app.test.js`](app/test/app.test.js)

### Option B: Test via GitHub Actions (Automatic)
Once pushed to GitHub, the CI/CD pipeline in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) will:
1. Run tests on every push to `main` and every PR
2. Build and push Docker image on push to `main`
3. Deploy to ECS (requires AWS secrets and manual approval)

## Project Test Configuration
- Test runner: Jest
- Test location: [`app/test/app.test.js`](app/test/app.test.js)
- Test commands in [`app/package.json`](app/package.json): `npm test`
- Endpoints tested: `/health`, `/status`, `/process`

## CI/CD Pipeline Flow
```
Push/PR to main → Run tests → (if push) Build Docker image → Push to GHCR → (manual approval) Deploy to ECS
```
