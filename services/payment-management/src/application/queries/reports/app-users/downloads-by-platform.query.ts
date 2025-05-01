

export class AppDownloadsByPlatformQuery {
  constructor(public readonly platform: 'android' | 'ios' | 'web' | 'desktop') {}
}