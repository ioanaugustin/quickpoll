import { Request } from 'express';

/**
 * Get the app URL from request or use Firebase hosting URL
 */
export function getAppUrl(req: Request): string {
  // In production, use your Firebase hosting URL
  // For local testing, use localhost
  const host = req.get('host') || '';

  if (host.includes('localhost')) {
    return 'http://localhost:4200';
  }

  // Firebase Hosting URL (deployed on Feb 4, 2026)
  return 'https://quickpoll-app-f3fed.web.app';
}

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
