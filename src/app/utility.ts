export class Utility {

  static parseJwt(token: string): unknown {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  static checkFilenameReplaceExtension(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase() ?? '';
    if (['jpeg', 'jpg', 'png'].includes(extension)) {
      return filename;
    }
    const baseName = filename.includes('.')
      ? filename.substring(0, filename.lastIndexOf('.'))
      : filename;
    return `${baseName}.jpg`;
  }
}
