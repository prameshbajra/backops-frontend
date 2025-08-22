import exifr from 'exifr';

export class Utility {

  static parseJwt(token: string): unknown {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  }

  static checkFilenameReplaceExtension(filename: string): string {
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

  static async extractImageMetadata(file: File): Promise<any | undefined> {
    try {
      if (file.type.startsWith('image/')) {
        const exifData = await exifr.parse(file, {
          exif: true,
          iptc: true,
          xmp: true,
          icc: true,
          jfif: true,
          ihdr: true,
          gps: true,
          tiff: true,
          interop: true,
          makerNote: false,
          userComment: true,
          reviveValues: true,
          sanitize: false,
          mergeOutput: true
        });

        if (exifData) {
          const metadata = { ...exifData };

          // Convert all date fields to ISO strings
          const dateFields = [
            'DateTimeOriginal', 'DateTime', 'CreateDate', 'ModifyDate',
            'DateTimeDigitized', 'FileModifyDate', 'FileAccessDate',
            'FileCreateDate', 'MetadataDate', 'XMPCreateDate', 'XMPModifyDate'
          ];

          dateFields.forEach(field => {
            if (metadata[field] && metadata[field] instanceof Date) {
              metadata[field] = metadata[field].toISOString();
            }
          });

          // Process GPS coordinates if available
          if (metadata.latitude && metadata.longitude) {
            metadata.gpsCoordinates = {
              latitude: metadata.latitude,
              longitude: metadata.longitude,
              altitude: metadata.GPSAltitude || metadata.altitude
            };
          }

          // Extract camera and lens information
          if (metadata.Make || metadata.Model) {
            metadata.camera = {
              make: metadata.Make,
              model: metadata.Model,
              software: metadata.Software,
              serialNumber: metadata.SerialNumber,
              lensModel: metadata.LensModel,
              lensInfo: metadata.LensInfo,
              lensMake: metadata.LensMake,
              lensSerialNumber: metadata.LensSerialNumber
            };
          }

          // Extract photo settings
          if (metadata.ISO || metadata.FNumber || metadata.ExposureTime) {
            metadata.photoSettings = {
              iso: metadata.ISO || metadata.ISOSpeedRatings,
              aperture: metadata.FNumber,
              shutterSpeed: metadata.ExposureTime,
              exposureMode: metadata.ExposureMode,
              whiteBalance: metadata.WhiteBalance,
              flash: metadata.Flash,
              focalLength: metadata.FocalLength,
              focalLengthIn35mmFormat: metadata.FocalLengthIn35mmFormat,
              meteringMode: metadata.MeteringMode,
              exposureCompensation: metadata.ExposureCompensation
            };
          }

          // Extract image dimensions and quality
          metadata.imageInfo = {
            width: metadata.ImageWidth || metadata.PixelXDimension,
            height: metadata.ImageHeight || metadata.PixelYDimension,
            orientation: metadata.Orientation,
            colorSpace: metadata.ColorSpace,
            compression: metadata.Compression,
            photometricInterpretation: metadata.PhotometricInterpretation,
            bitsPerSample: metadata.BitsPerSample,
            samplesPerPixel: metadata.SamplesPerPixel
          };

          console.log('Extracted comprehensive image metadata:', metadata);
          return metadata;
        }
      }
    } catch (error) {
      console.warn('Could not extract EXIF metadata from file:', file.name, error);
    }
    return undefined;
  }
}
