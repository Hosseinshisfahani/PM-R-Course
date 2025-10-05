# CI/CD Setup Guide

This document explains the GitHub Actions CI/CD pipeline setup for the Medical Course Django project.

## 🚀 Overview

The CI/CD pipeline includes:
- **Continuous Integration (CI)**: Automated testing, linting, and code quality checks
- **Continuous Deployment (CD)**: Automated deployment to staging and production
- **Security Scanning**: Regular security vulnerability checks
- **Dependency Management**: Automated dependency updates
- **Database Backup**: Automated daily backups

## 📁 Workflow Files

### 1. CI Pipeline (`.github/workflows/ci.yml`)
**Triggers**: Push to main/develop, Pull requests
**Features**:
- Multi-Python version testing (3.9, 3.10, 3.11)
- PostgreSQL service for database testing
- Code linting with flake8, black, isort
- Security scanning with bandit and safety
- Test coverage reporting
- Docker image building

### 2. CD Pipeline (`.github/workflows/cd.yml`)
**Triggers**: Push to main, version tags, manual dispatch
**Features**:
- Staging deployment on main branch pushes
- Production deployment on version tags
- Docker image building and pushing to GitHub Container Registry
- Environment-specific deployments
- GitHub releases for version tags

### 3. Security Scanning (`.github/workflows/security.yml`)
**Triggers**: Daily schedule, push to main, PRs, manual
**Features**:
- Dependency vulnerability scanning
- Code security analysis with bandit and semgrep
- Docker image vulnerability scanning with Trivy
- Secret scanning with TruffleHog
- Security reports and GitHub Security tab integration

### 4. Dependency Updates (`.github/workflows/dependencies.yml`)
**Triggers**: Weekly schedule, manual
**Features**:
- Automated dependency updates
- Security vulnerability detection
- Pull request creation for updates
- GitHub issue creation for security issues

### 5. Database Backup (`.github/workflows/backup.yml`)
**Triggers**: Daily schedule, manual
**Features**:
- Automated PostgreSQL backups
- S3 storage integration
- Backup retention (30 days)
- Backup status notifications

## 🐳 Docker Setup

### Dockerfile
- Multi-stage build for production optimization
- Non-root user for security
- Health checks included
- Static file collection
- Gunicorn WSGI server

### docker-compose.yml
- Development environment with PostgreSQL and Redis
- Volume mounting for development
- Health checks for all services
- Nginx configuration for production

## 🔧 Required Secrets

Add these secrets to your GitHub repository settings:

### CI/CD Secrets
```
GITHUB_TOKEN                    # Automatically provided
```

### Deployment Secrets
```
DATABASE_URL                    # Production database connection string
AWS_ACCESS_KEY_ID              # For S3 backups
AWS_SECRET_ACCESS_KEY          # For S3 backups
S3_BACKUP_BUCKET              # S3 bucket name for backups
```

### Application Secrets
```
GOOGLE_CLIENT_ID               # Google OAuth client ID
GOOGLE_CLIENT_SECRET           # Google OAuth client secret
STRIPE_PUBLISHABLE_KEY         # Stripe publishable key
STRIPE_SECRET_KEY              # Stripe secret key
```

## 🚀 Getting Started

### 1. Enable GitHub Actions
1. Go to your repository settings
2. Navigate to "Actions" → "General"
3. Enable "Allow all actions and reusable workflows"

### 2. Set up Environments
1. Go to repository settings → "Environments"
2. Create `staging` and `production` environments
3. Add required secrets to each environment

### 3. Configure Branch Protection
1. Go to repository settings → "Branches"
2. Add rule for `main` branch:
   - Require status checks to pass
   - Require branches to be up to date
   - Select required status checks:
     - `test (3.11)`
     - `security`
     - `build`

### 4. Local Development Setup

#### Using Docker Compose
```bash
# Copy environment variables
cp env_example.txt .env

# Start development environment
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser
```

#### Using Virtual Environment
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/requirements-dev.txt

# Set up environment variables
cp env_example.txt .env

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

## 📊 Monitoring and Notifications

### GitHub Security Tab
- View security vulnerabilities
- Track security scan results
- Manage security advisories

### Workflow Status
- Monitor workflow runs in the "Actions" tab
- Set up notifications for failed workflows
- Review security scan reports

### Code Coverage
- Coverage reports generated in CI
- Upload to Codecov for tracking
- Coverage badges in README

## 🔍 Testing

### Running Tests Locally
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_models.py

# Run with verbose output
pytest -v
```

### Code Quality Checks
```bash
# Linting
flake8 .

# Code formatting
black --check .
isort --check-only .

# Type checking
mypy .

# Security scanning
bandit -r .
safety check
```

## 🚀 Deployment

### Staging Deployment
- Automatically deploys on push to `main`
- Uses staging environment secrets
- Accessible at your staging URL

### Production Deployment
- Deploys on version tags (e.g., `v1.0.0`)
- Uses production environment secrets
- Creates GitHub releases

### Manual Deployment
```bash
# Trigger manual deployment
gh workflow run cd.yml -f environment=staging
```

## 📝 Best Practices

### Commit Messages
- Use conventional commits: `feat:`, `fix:`, `docs:`, etc.
- Include `[skip ci]` for dependency-only updates

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- Feature branches: `feature/description`
- Hotfix branches: `hotfix/description`

### Code Reviews
- All changes require PR review
- CI checks must pass before merge
- Security scans must pass

### Environment Management
- Use environment-specific secrets
- Never commit secrets to repository
- Use `.env` files for local development

## 🛠️ Troubleshooting

### Common Issues

#### Workflow Failures
1. Check workflow logs in GitHub Actions
2. Verify all required secrets are set
3. Ensure environment configurations are correct

#### Docker Build Issues
1. Check Dockerfile syntax
2. Verify all dependencies in requirements/requirements.txt
3. Check for missing files in .dockerignore

#### Database Connection Issues
1. Verify DATABASE_URL format
2. Check database service health
3. Ensure proper network connectivity

### Getting Help
1. Check GitHub Actions documentation
2. Review workflow logs for specific errors
3. Consult Django deployment guides
4. Check Docker and docker-compose documentation

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Security Best Practices](https://docs.djangoproject.com/en/4.2/topics/security/)
