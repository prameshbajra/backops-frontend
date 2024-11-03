export interface GetObjectListResponse {
  items: FileItem[];
}


export interface FileItem {
  PK: string;
  SK: string;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  isSelected?: boolean;
}
