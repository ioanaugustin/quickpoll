import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import QRCode from 'qrcode';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private snackBar = inject(MatSnackBar);

  getShareUrl(pollId: string): string {
    return `${window.location.origin}/p/${pollId}`;
  }

  async shareToWhatsApp(pollId: string, pollTitle: string): Promise<void> {
    const url = this.getShareUrl(pollId);
    const text = encodeURIComponent(`Vote on: ${pollTitle}`);
    const whatsappUrl = `https://wa.me/?text=${text}%20${url}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  async shareToTelegram(pollId: string, pollTitle: string): Promise<void> {
    const url = this.getShareUrl(pollId);
    const text = encodeURIComponent(`Vote on: ${pollTitle}`);
    const telegramUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  }

  async shareNative(pollId: string, pollTitle: string): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pollTitle,
          text: `Vote on: ${pollTitle}`,
          url: this.getShareUrl(pollId),
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          this.copyLink(pollId);
        }
      }
    } else {
      this.copyLink(pollId);
    }
  }

  async copyLink(pollId: string): Promise<void> {
    const url = this.getShareUrl(pollId);

    try {
      await navigator.clipboard.writeText(url);
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      this.fallbackCopyLink(url);
    }
  }

  private fallbackCopyLink(url: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      this.snackBar.open('Link copied to clipboard!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      console.error('Fallback copy failed:', error);
      this.snackBar.open('Failed to copy link', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } finally {
      document.body.removeChild(textArea);
    }
  }

  async generateQRCode(pollId: string): Promise<string> {
    const url = this.getShareUrl(pollId);

    try {
      return await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  async downloadQRCode(pollId: string, pollTitle: string): Promise<void> {
    try {
      const qrDataUrl = await this.generateQRCode(pollId);

      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `quickpoll-${pollId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.snackBar.open('QR code downloaded!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      this.snackBar.open('Failed to download QR code', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    }
  }

  isWebShareSupported(): boolean {
    return navigator.share !== undefined;
  }
}
