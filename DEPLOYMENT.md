# Deployment Guide

This guide will walk you through deploying the Universal Converter to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your local machine
- Node.js and npm installed (for local testing)

## Steps to Deploy to GitHub Pages

1. **Create a new GitHub repository**
   - Go to [GitHub](https://github.com/new)
   - Name your repository (e.g., `universal-converter`)
   - Choose whether to make it public or private
   - Do not initialize it with a README, .gitignore, or license

2. **Initialize Git and push your code**
   ```bash
   # Navigate to your project directory
   cd path/to/universal-converter
   
   # Initialize a Git repository
   git init
   
   # Add all files
   git add .
   
   # Commit the files
   git commit -m "Initial commit"
   
   # Add the GitHub repository as a remote
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   
   # Rename the default branch to main
   git branch -M main
   
   # Push your code to GitHub
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on "Settings"
   - In the left sidebar, click on "Pages"
   - Under "Source", select the `main` branch
   - Click "Save"
   - Wait a few minutes for GitHub to deploy your site
   - Your site will be available at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`

## Setting Up a Custom Domain (Optional)

If you want to use a custom domain:

1. Purchase a domain from a domain registrar (e.g., Google Domains, Namecheap, etc.)
2. In your repository settings, under "Pages", enter your custom domain in the "Custom domain" field
3. Configure your DNS settings with your domain registrar to point to GitHub Pages
   - Add an A record pointing to `185.199.108.153`
   - Add a CNAME record with `www` pointing to `YOUR-USERNAME.github.io`
4. Wait for DNS propagation (this can take up to 48 hours)

## Updating Your Site

To update your site:

```bash
# Make your changes
# ...

# Stage all changes
git add .

# Commit the changes
git commit -m "Update: Your update message"

# Push the changes to GitHub
git push origin main
```

Your changes will be automatically deployed to GitHub Pages within a few minutes.

## Troubleshooting

- If your site isn't updating, try clearing your browser cache
- Check the GitHub Actions tab in your repository for any build errors
- Ensure all file paths in your HTML, CSS, and JavaScript are relative
- Make sure your `index.html` is in the root directory of your repository

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domains on GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-jekyll-build-errors-for-github-pages-sites)
