# GitHub Releases APK setup

This project now includes an Android wrapper and a GitHub Actions workflow that builds an APK and attaches it to a GitHub Release.

## 1. Put the project on GitHub
Upload/push the contents of this folder to your GitHub repository.

## 2. Set the deployed web-app URL
The Android APK is a WebView wrapper around the existing Capital Vault web app. The web app must be deployed somewhere over HTTPS because the project uses TanStack Start server functions for license activation.

In GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**.

Create:

`CAPITAL_VAULT_URL`

Value:

`https://YOUR-DEPLOYED-CAPITAL-VAULT-URL`

Do not put Supabase service-role keys or other secrets in this variable.

## 3. Create a release
Create and push a version tag, for example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build `Capital-Vault-V1.0.apk` and attach it to the `v1.0.0` release.

You can also run the workflow manually from **Actions → Build and publish APK → Run workflow** and enter the deployed URL.

## Important
The generated APK is a debug-signed APK. It is suitable for direct installation/testing and for GitHub Release distribution. For Play Store publishing or a production-signed APK, use a private Android signing key stored in GitHub Secrets.
