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

  static getMonths(): string[] {
    return [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ];
  }

  static getYears(): number[] {
    const startYear = 2023;
    const currentYear = new Date().getFullYear();
    let years: number[] = [];
    for (let year = startYear; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }
}
