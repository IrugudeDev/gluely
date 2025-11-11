# Downloading the Windows executable

The repository is wired to produce a portable Windows build of the Electron desktop app. Because the sandbox cannot reach the npm registry, the `.exe` is generated via GitHub Actions.

## TL;DR

1. Push the repository to GitHub (instructions below).
2. Trigger the **Build Windows desktop package** workflow (automatically runs on push to `main`, or run manually via **Actions → Build Windows desktop package → Run workflow**).
3. Download the artifact named `gluely-copilot-win-portable`; it contains `Gluely Copilot.exe` ready to run.

## Step-by-step

### 1. Push the code to GitHub

Follow the instructions in the main `README.md` (section "Publishing to Your GitHub Repository"). After pushing, GitHub will have the latest code and the workflow will pick it up.

### 2. Wait for the workflow to finish

Navigate to **Actions** in your GitHub repository, then open **Build Windows desktop package**. Each push creates a new run. Wait until the run status turns green.

### 3. Download the executable

Inside the successful run page, scroll to the **Artifacts** section, click `gluely-copilot-win-portable`, and download the ZIP. Extract it to reveal `Gluely Copilot.exe`. Double-click the executable to launch the overlay app.

> **Tip:** The artifact always contains the most recent build of the `work` branch if that branch was pushed. Use branch filters or tags if you maintain multiple release lines.

## Automation helper

Use the helper script `scripts/download-latest-win-exe.sh` after authenticating with the GitHub CLI (`gh auth login`). It pulls the newest artifact automatically.
