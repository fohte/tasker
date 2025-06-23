import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import { execSync } from 'child_process'
import type { NextConfig } from 'next'

// Get git commit hash at build time
const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch (error) {
    console.warn('Could not get git commit hash:', error)
    return 'unknown'
  }
}

// Get app version from environment variable or fall back to git commit hash
const getAppVersion = () => {
  return process.env.APP_VERSION || getGitCommitHash()
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: getAppVersion(),
  },
}

// Initialize OpenNext Cloudflare adapter for development
if (process.env.NODE_ENV === 'development') {
  await initOpenNextCloudflareForDev()
}

export default nextConfig
