/**
 * Link utilities for sharing
 * Handles generating shareable links that work on both local and production
 */

/**
 * Get the base URL for the app
 * Works on both local development and Vercel production
 */
export function getBaseUrl(): string {
  // Check if we're on web
  if (typeof window !== 'undefined') {
    // Use current origin for web (works on both local and production)
    return window.location.origin;
  }
  
  // For React Native, we need to use environment variables
  // Fallback to a default if not set (should be set in production)
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_SITE_URL) {
    return process.env.EXPO_PUBLIC_SITE_URL;
  }
  
  // Fallback for local development (adjust if your local URL is different)
  return 'http://localhost:8081';
}

/**
 * Generate a referral signup link
 * @param referralCode - The referral code to include in the link
 * @returns A URL that opens the signup page with the referral code pre-filled
 */
export function generateReferralLink(referralCode: string): string {
  const baseUrl = getBaseUrl();
  // Expo Router: group routes like (auth) are hidden from URLs
  // So app/(auth)/login.tsx becomes /login in the URL
  const path = '/login';
  const url = new URL(path, baseUrl);
  url.searchParams.set('referralCode', referralCode);
  url.searchParams.set('mode', 'signup');
  return url.toString();
}

/**
 * Generate a private match join link
 * @param joinCode - The match join code
 * @returns A URL that opens the match lobby with the join code pre-filled
 */
export function generateMatchJoinLink(joinCode: string): string {
  const baseUrl = getBaseUrl();
  // Expo Router: app/(tabs)/new-match.tsx becomes /new-match in the URL
  const path = '/new-match';
  const url = new URL(path, baseUrl);
  url.searchParams.set('joinCode', joinCode);
  return url.toString();
}

/**
 * Generate a private tournament join link
 * @param joinCode - The tournament join code
 * @returns A URL that opens the tournament lobby with the join code pre-filled
 */
export function generateTournamentJoinLink(joinCode: string): string {
  const baseUrl = getBaseUrl();
  // Expo Router: app/(tabs)/tournaments.tsx becomes /tournaments in the URL
  const path = '/tournaments';
  const url = new URL(path, baseUrl);
  url.searchParams.set('joinCode', joinCode);
  return url.toString();
}

