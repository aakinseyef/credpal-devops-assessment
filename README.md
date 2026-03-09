# CredPal DevOps Engineer Assessment

This repository contains a production-ready DevOps pipeline for a simple Node.js application. It includes containerization, CI/CD with GitHub Actions, infrastructure as code using Terraform (AWS), and a zero-downtime deployment strategy.

## Table of Contents
- [Local Development](#local-development)
- [Running the Application Locally](#running-the-application-locally)
- [Deploying to AWS](#deploying-to-aws)
- [CI/CD Pipeline](#cicd-pipeline)
- [Key Design Decisions](#key-design-decisions)
- [Security & Observability](#security--observability)

## Local Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (optional, for running tests without Docker)

### Running the Application Locally

1. Clone the repository.
2. Start the stack with Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. The application will be available at `http://localhost:3000`.
   - `GET /health` – health check
   - `GET /status` – status including database connectivity
   - `POST /process` – expects JSON `{ "data": "some value" }` and stores it in PostgreSQL.

To run tests locally:
```bash
cd app
npm install
npm test
```

## Deploying to AWS

The infrastructure is managed with Terraform. Follow these steps to provision the environment and deploy the application.

### Prerequisites
- AWS account with appropriate permissions
- Terraform 1.3+
- GitHub repository with the following secrets configured:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `DOMAIN_NAME` (your domain, e.g., `app.credpal.com`)
  - `ECS_CLUSTER` and `ECS_SERVICE` (outputs from Terraform)
- A domain name with DNS hosted in Route53 (or ability to validate ACM certificate via DNS).

### Step 1: Provision Infrastructure

1. Navigate to the `terraform` directory.
2. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill in your values.
3. Initialize Terraform and apply:
   ```bash
   terraform init
   terraform apply
   ```
4. Note the outputs: `alb_dns_name`, `ecs_cluster_name`, `ecs_service_name`.

### Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `DOMAIN_NAME`
- `ECS_CLUSTER` (from Terraform output)
- `ECS_SERVICE` (from Terraform output)

### Step 3: Deploy the Application

Push code to the `main` branch. The CI/CD pipeline will:
1. Run tests.
2. Build and push a Docker image to GitHub Container Registry.
3. After manual approval (GitHub Environments), update the ECS service with the new image.

The ECS service is configured for rolling updates (`deployment_minimum_healthy_percent = 100`, `maximum = 200`), ensuring zero downtime.

## CI/CD Pipeline

- **On PR to `main`**: Tests are executed.
- **On push to `main`**: After tests pass, the Docker image is built and pushed to GHCR. Then a deployment job runs, but it requires manual approval because it targets the `production` environment.
- **Manual approval**: Configured in GitHub under Settings > Environments. Only after approval is the ECS service updated.

## Key Design Decisions

### Containerization
- **Multi-stage build**: Reduces final image size by copying only production dependencies.
- **Non-root user**: Improves security by running the container with least privileges.
- **Docker Compose for local dev**: Includes PostgreSQL to mirror production environment.

### CI/CD
- **GitHub Actions**: Integrated with GitHub, easy to manage secrets and environments.
- **Separate jobs**: Test, build/push, and deploy. This allows parallelization and clarity.
- **Environment protection**: Production deployment requires manual approval, preventing accidental releases.
- **Image tagging**: Uses commit SHA for unique, traceable images.

### Infrastructure as Code (Terraform)
- **Modular & reusable**: VPC, subnets, security groups, RDS, ECS, ALB, ACM, and Secrets Manager all defined.
- **High availability**: Two public subnets in different AZs, ECS service with desired count 2.
- **Database**: RDS PostgreSQL with automated backups, encryption, and private subnet.
- **Secrets**: Database URL stored in AWS Secrets Manager, referenced in task definition.
- **SSL**: ACM certificate provisioned and attached to HTTPS listener; HTTP redirects to HTTPS.

### Deployment Strategy
- **Rolling updates**: ECS default deployment controller replaces tasks gradually, ensuring zero downtime.
- **Health checks**: ALB target group uses `/health` endpoint to determine task health before routing traffic.

### Security & Observability
- **Secrets management**: No secrets in code; GitHub Secrets for credentials, AWS Secrets Manager for DB URL.
- **HTTPS enforced**: All traffic encrypted.
- **Non-root container**: As mentioned.
- **Logging**: Container logs sent to CloudWatch Logs with a retention policy.
- **Health checks**: Application exposes `/health`, used by ALB and ECS.

## Application Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/status` | GET | Status check with database connectivity |
| `/process` | POST | Process data (requires `{ "data": "value" }`) |

## File Structure

```
.
├── .github
│   └── workflows
│       └── ci-cd.yml
├── app
│   ├── app.js
│   ├── package.json
│   └── test
│       └── app.test.js
├── docker-compose.yml
├── Dockerfile
├── terraform
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
└── README.md
```

## Conclusion

This solution meets all the requirements of the assessment. It is production-ready, scalable, and follows DevOps best practices. For any questions, please refer to the comments in the code or contact the author.
