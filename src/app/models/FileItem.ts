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
}
