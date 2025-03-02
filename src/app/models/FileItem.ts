export interface GetObjectResponse {
  item: FileItem;
}

export interface GetObjectListResponse {
  items: FileItem[];
  nextToken: string;
}


export interface FileItem {
  PK: string;
  SK: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  isSelected?: boolean;
  details?: { FaceRecords: FaceRecord[] };
}

export interface BoundingBox {
  Height: number;
  Left: number;
  Top: number;
  Width: number;
}

export interface Face {
  FaceId: string;
  BoundingBox: BoundingBox;
  ImageId: string;
  Confidence: number;
}

export interface FaceRecord {
  Face: Face;
  FaceDetail: unknown;
}
