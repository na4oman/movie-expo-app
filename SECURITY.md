# Security Guidelines

## 🔒 Environment Variables

This project uses environment variables to manage sensitive data like API keys. Follow these guidelines:

### Setup
1. Copy `.env.example` to `.env`
2. Fill in your actual API keys in `.env`
3. Never commit `.env` to version control

### API Keys Required
- **TMDB_API_KEY**: Get from [TMDB API Settings](https://www.themoviedb.org/settings/api)

### Files to Never Commit
- `.env` (contains actual secrets)
- Any file with hardcoded API keys
- Personal configuration files

### Files Safe to Commit
- `.env.example` (template with placeholder values)
- Configuration files that reference environment variables

## 🚨 Before Pushing to Public Repository

**CRITICAL CHECKLIST:**
- [ ] All API keys moved to `.env` file
- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded secrets in any committed files
- [ ] `.env.example` provided for other developers
- [ ] All API calls use environment variables

## 🔍 How to Check for Secrets

Run this command to search for potential secrets:
```bash
grep -r "api_key\|API_KEY\|secret\|password\|token" --exclude-dir=node_modules --exclude="*.md" .
```

If this returns any results (other than environment variable references), review and secure those files.

## 📝 Reporting Security Issues

If you find security vulnerabilities, please:
1. Do NOT open a public issue
2. Contact the maintainers privately
3. Provide details about the vulnerability
4. Allow time for the issue to be fixed before disclosure

## 🛡️ Best Practices

1. **Environment Variables**: Use `.env` files for all secrets
2. **Git Ignore**: Always add sensitive files to `.gitignore`
3. **Code Review**: Review all commits for accidentally included secrets
4. **Rotation**: Regularly rotate API keys and tokens
5. **Minimal Permissions**: Use API keys with minimal required permissions