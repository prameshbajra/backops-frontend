export interface BoundingBox {
  Height: number;
  Left: number;
  Top: number;
  Width: number;
}

export interface FaceData {
  PK: string;
  SK: string;
  boundingBox: BoundingBox;
  confidence: number;
}
