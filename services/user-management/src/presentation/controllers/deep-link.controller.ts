import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { log } from 'console';

@Controller()
export class DeepLinkController {
    private readonly VALID_TOKEN_REGEX = /^[a-f0-9]{64}$/i;
    @Get('app')
    async handlePasswordReset(
        @Query('token') token: string,
        @Res() res: Response,
        @Req() req: Request,
        @Headers('user-agent') userAgent: string
    ) {
        if (!this.validateToken(token)) {
            return res.status(400).send('Invalid or expired token');
        }

        const clientIp = this.getClientIp(req);
        const platform = this.detectPlatform(userAgent || '');
        const encodedToken = encodeURIComponent(token);

        this.logRedirectAttempt(clientIp, token, platform);

        const redirectHtml = this.buildRedirectPage(encodedToken, platform);
        res.setHeader('Content-Type', 'text/html');
        res.send(redirectHtml);
    }

    private validateToken(token: string): boolean {
        return token && this.VALID_TOKEN_REGEX.test(token);
    }

    private getClientIp(req: Request): string {
        return (
            req.ip ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.headers['x-forwarded-for']?.toString() ||
            'unknown'
        );
    }

    private detectPlatform(userAgent: string): 'ios' | 'android' | 'desktop' {
        const ua = userAgent.toLowerCase();
        if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
        if (ua.includes('android')) return 'android';
        return 'desktop';
    }

    private logRedirectAttempt(ip: string, token: string, platform: string) {
        const hashedIp = createHash('sha256').update(ip).digest('hex');
        console.log(`Redirect attempt`, {
            hashedIp,
            tokenHash: createHash('sha256').update(token).digest('hex').substring(0, 8),
            platform,
            timestamp: new Date().toISOString()
        });
    }

    private removePrefixFromDeepLink(url) {
        if (url && url.startsWith('http://89.117.37.84:4000/')) {
            return url.replace('http://89.117.37.84:4000/', '');
        }
        return url;
    }

    private buildRedirectPage(token: string, platform: string): string {
        const deepLinkWithPrefix = `${process.env.APP_DEEP_LINK}?token=${token}`;
        const webLink = `${process.env.WEB_RESET_LINK}?token=${token}`;
        const appStoreLink = platform === 'ios'
            ? process.env.IOS_APP_STORE_LINK
            : process.env.ANDROID_PLAY_STORE_LINK;

        const deepLink = this.removePrefixFromDeepLink(deepLinkWithPrefix)

        return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redirecting to Hobbe EVMS</title>
      <script>
          function launchApp() {
              const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
              const isAndroid = /Android/i.test(navigator.userAgent);
              const startTime = Date.now();
              
              document.getElementById('spinner').style.display = 'block';
              document.getElementById('message').style.display = 'none';
              document.getElementById('buttons').style.display = 'none';
              
              if (isIOS) {
                  document.getElementById('ios-button').style.display = 'inline-block';
                  document.getElementById('message').innerText = 'Tap the button below to open in app';
                  document.getElementById('message').style.display = 'block';
              } 
              else if (isAndroid) {
                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'block';
                  iframe.src = '${deepLink}';
                  document.body.appendChild(iframe);
                  
                  setTimeout(function() {
                      if (Date.now() - startTime < 2000) {
                          fallbackToWeb();
                      }
                  }, 1500);
              }
              else {
                  window.location.href = '${webLink}';
              }
          }
          
          function fallbackToWeb() {
              document.getElementById('spinner').style.display = 'none';
              document.getElementById('message').innerText = 'Redirecting to browser...';
              document.getElementById('message').style.display = 'block';
              setTimeout(() => {
                  window.location.href = '${webLink}';
              }, 1000);
          }
          
          function manualOpen() {
              window.location.href = '${deepLink}';
              
              setTimeout(() => {
                  if (!document.hidden) {
                      fallbackToWeb();
                  }
              }, 1000);
          }
          
          window.addEventListener('DOMContentLoaded', launchApp);
      </script>
      <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; }
          #spinner { 
              border: 4px solid rgba(0,0,0,0.1); 
              border-radius: 50%; 
              border-top: 4px solid #3498db;
              width: 40px; height: 40px;
              animation: spin 1s linear infinite;
              margin: 2rem auto;
              display: none;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .btn { 
              display: inline-block;
              padding: 10px 20px;
              margin: 10px;
              border-radius: 5px;
              text-decoration: none;
              font-weight: bold;
          }
          .web-btn { background: #3498db; color: white; }
          .app-btn { background: white; color: #3498db; border: 2px solid #3498db; }
          #message { font-size: 16px; margin-top: 1rem; display: none; }
          #buttons { margin-top: 2rem; }
          #ios-button { display: none; }
      </style>
  </head>
  <body>
      <div id="spinner"></div>
      <h2>Taking you to Hobbe EVMS...</h2>
      <div id="message"></div>
      
      <div id="buttons">
          <button id="ios-button" onclick="manualOpen()" class="btn app-btn">Open in App</button>
          <a href="${webLink}" class="btn web-btn">Continue in Browser</a>
          ${platform !== 'desktop' ?
                `<a href="${appStoreLink}" class="btn app-btn">Get Mobile App</a>` : ''}
      </div>
  </body>
  </html>`}
}