# 🚀 GitHub Auto-Deploy Setup

Automatically deploy your Cloudflare Worker when you push to GitHub!

## Setup Steps:

### 1. Create Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Click **"Continue to summary"**
5. Click **"Create Token"**
6. **Copy the token** (you won't see it again!)

### 2. Add Token to GitHub Secrets

1. Go to your repo: https://github.com/ch4rlie/demon-hunter-generator
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `CLOUDFLARE_API_TOKEN`
5. Value: Paste your API token
6. Click **"Add secret"**

### 3. Push the Workflow

```bash
git add .github/workflows/deploy-worker.yml
git commit -m "Add auto-deploy workflow for Cloudflare Worker"
git push
```

### 4. Test It!

Make any change to a file in `workers/transform-image/`, then:

```bash
git add .
git commit -m "Test auto-deploy"
git push
```

Go to: https://github.com/ch4rlie/demon-hunter-generator/actions

You should see the deployment running! 🎉

---

## How It Works:

- **Triggers**: Only when you push changes to `workers/transform-image/` folder
- **Deploys**: Automatically runs `wrangler deploy`
- **Fast**: Takes ~30 seconds
- **Safe**: Uses official Cloudflare GitHub Action

---

## After Setup:

### ✅ Automatic (via GitHub):
- Push code → Auto-deploys worker
- No manual `npm run deploy` needed

### 🔧 Manual (when testing locally):
```bash
npm run deploy  # Still works for quick local deploys
```

---

## Check Deployment Status:

- GitHub Actions: https://github.com/ch4rlie/demon-hunter-generator/actions
- Cloudflare Dashboard: https://dash.cloudflare.com/ → Workers & Pages

---

**Pro tip:** You can also set this up for staging/production branches if needed!
