# TypeScript Project Documentation & Portfolio

Welcome to the **TypeScript Project Documentation** repository. This workspace serves as a centralized collection and architectural reference for full-stack and backend applications built with TypeScript, Node.js, Express, React, and modern database ecosystems.

---

## Overview

The primary goal of this repository is to document design patterns, technical specifications, API contracts, domain architectures, and deployment workflows across various TypeScript applications.

Each project contained within this workspace includes:
- **Comprehensive Technical Documentation**: System design, data models, authentication flows, and API route definitions.
- **Strict Type System Standards**: Implementation of strong typing, ESM resolution, and strict compiler options.
- **End-to-End Environment Setup**: Standardized procedures for local development, database migrations, seeding, and production deployments.

---

## Repository Projects

```text
Typescript_Project_Documentation/
├── EcommerceAPI/           # Full-Stack E-Commerce API (Express, PostgreSQL, Stripe) & Storefront (React 19, Vite)
├── express_weather_api/     # Express/TypeScript REST API for weather service integration
└── weather_api_manual/      # Manual testing specs, documentation, and API request collections
```

### Deployed Links (`EcommerceAPI`)
- **Frontend (meridian)**: [https://meridianfrontend-btrjfjjyv-faradayotuoniyo-gmailcoms-projects.vercel.app/](https://meridianfrontend-btrjfjjyv-faradayotuoniyo-gmailcoms-projects.vercel.app/)
- **Backend (REST API)**: [https://meridianbackend.vercel.app/](https://meridianbackend.vercel.app/)

project URL = https://roadmap.sh/projects/ecommerce-api
---

## Technical Standards

All projects in this repository adhere to the following software engineering principles:

- **Type Safety**: TypeScript configured with strict type checking and zero implicit `any` declarations.
- **Modular Architecture**: Layered separation of concerns (Controllers/Routes, Services, Data Access Layer, Middleware).
- **Environment Parity**: Explicit environment variable schemas (`.env.example`) for seamless setup across development, staging, and production.
- **Automated Workflows**: Standardized npm scripts for building, testing, linting, and database seeding.

---

## Getting Started

To explore or run any individual project:

1. Navigate to the project directory:
   ```bash
   cd <project_name>
   ```
2. Refer to the project-specific `README.md` file located inside its directory for detailed prerequisites, environment configuration, and execution commands.
