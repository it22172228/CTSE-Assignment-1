# Security and DevSecOps Integration

This document summarizes basic security best practices for the project and describes how to enable managed SAST tooling (SonarCloud) in CI.

1) Recommended tool
- Use **SonarCloud** for code-quality and SAST-style analysis (free for open-source). It detects insecure coding patterns, hard-coded credentials, and common vulnerabilities in code.

Recommendation: use SonarCloud for SAST/code quality in this project.

2) CI integration (GitHub Actions)
- The repository includes a workflow:
  - `.github/workflows/sonarcloud.yml` — runs SonarCloud analysis on push/PR.

You must add the following GitHub repository secret:
- `SONAR_TOKEN` — token from SonarCloud (Project or Organization token)

3) Least privilege & Azure guidance
- Use managed identities instead of embedding credentials. For Azure Container Apps / resources, prefer a User-Assigned Managed Identity and assign narrow roles only.

Azure CLI examples (adapt names and scopes to your environment):

```bash
# create a resource group / identity
az group create -n my-rg -l eastus
az identity create -g my-rg -n my-app-identity

# assign role to identity (only the minimum role needed). Example: Storage Blob Data Reader
az role assignment create --assignee <identity-principal-id> --role "Storage Blob Data Reader" --scope /subscriptions/<sub>/resourceGroups/my-rg
```

- For network controls, use Network Security Groups (NSGs) to restrict inbound traffic to only necessary ports (e.g., 443) and allow traffic between microservices on private networks or VNETs.

4) App-level hardening (Node.js / Express guidelines)
- Validate and sanitize all input; use strong validation libraries.
- Use HTTPS and enforce secure cookies.
- Store secrets in a managed secret store (Azure Key Vault or GitHub Secrets). Do not commit secrets.
- Use helmet (or equivalent) to set secure HTTP headers.
- Use parameterized queries / ORM validation to prevent injection.
- Limit logs for sensitive information; redact personal data.

5) Runtime & platform
- Run containers with non-root users where possible.
- Limit container capabilities and apply resource limits.
- Consider enabling container image scanning in your build pipeline (Trivy, Clair, or similar).

6) Ongoing DevSecOps
- Configure PR gates: fail or warn PRs on critical/high findings from SonarCloud.
- Triage findings: prioritize critical/high, fix or suppress with documented rationale.
- Periodically review role assignments and secrets.

If you want, I can:
- Configure the SonarCloud project settings and create `sonar-project.properties` for fine-tuned analysis.
- Add PR gate configuration and help set the `SONAR_TOKEN` GitHub secret.
