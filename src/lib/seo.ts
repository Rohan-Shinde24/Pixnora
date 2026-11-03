export const siteKeywords = [
  "AI image prompts",
  "AI art prompts",
  "Midjourney prompts",
  "DALL·E prompts",
  "Stable Diffusion prompts",
  "AI image inspiration",
  "image generation prompts",
  "creative prompts",
  "prompt library",
];

export function getSiteBaseUrl(): URL | undefined {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configuredUrl) return new URL(configuredUrl);

  const deploymentHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return deploymentHost ? new URL(`https://${deploymentHost}`) : undefined;
}
