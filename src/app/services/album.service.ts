import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FileItem } from '../models/FileItem';

export interface Album {
  albumId: string;
  albumName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.AUTH_API_URL;

  getAlbums(): Observable<Album[]> {
    const url = `${this.baseUrl}get-album-for-user`;
    // TODO: Implement proper type here .. Should not be any here ...
    return this.http.get<any>(url).pipe(
      map((response) => {
        const candidates = this.extractAlbumArray(response);
        return candidates
          .map((raw) => this.normalizeAlbum(raw))
          .filter((album): album is Album => album !== null);
      })
    );
  }

  createAlbum(albumName: string): Observable<Album> {
    const url = `${this.baseUrl}create-update-album`;
    // TODO: Switch map is not really necessary here ...
    return this.http.post<any>(url, { albumName }).pipe(
      switchMap((response) => this.resolveAlbumIdentifier(response, albumName))
    );
  }

  assignItemsToAlbum(albumId: string, files: FileItem[]): Observable<any> {
    const onlyAlbumId = albumId.replace("ALBUM#", "");
    const url = `${this.baseUrl}album/${onlyAlbumId}/assign`;
    const items = files.map(({ PK, SK }) => ({ PK, SK }));
    return this.http.post<any>(url, { items });
  }

  private resolveAlbumIdentifier(response: any, fallbackName: string): Observable<Album> {
    const direct = this.extractAlbum(response, fallbackName);
    if (direct) {
      return of(direct);
    }

    return this.getAlbums().pipe(
      map((albums) => {
        const match = albums.find((album) => album.albumName === fallbackName);

        if (match?.albumId) {
          return match;
        }

        throw new Error('Unable to determine album identifier from create response.');
      })
    );
  }

  private extractAlbum(response: any, fallbackName: string): Album | null {
    if (!response) {
      return null;
    }

    const album = response.album ?? response;
    const normalized = this.normalizeAlbum({ ...album, fallbackName });

    if (normalized) {
      return normalized;
    }

    // TODO: What is this horrible thing ???
    const albumId = album.albumId ?? album.id ?? album.AlbumId ?? album.Id ?? album.PK ?? album.pk ?? null;
    const albumName = album.albumName ?? album.name ?? album.AlbumName ?? album.Name ?? fallbackName;

    if (albumId) {
      return { albumId, albumName };
    }

    return null;
  }

  // TODO: This is not really needed if we give proper types to the HTTP responses ...
  private extractAlbumArray(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.albums)) {
      return response.albums;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    if (Array.isArray(response?.album)) {
      return response.album;
    }

    return [];
  }

  // TODO: Same here, this is not needed with proper types ...
  private normalizeAlbum(raw: any): Album | null {
    if (!raw) {
      return null;
    }

    const albumId = raw.albumId ?? raw.id ?? raw.AlbumId ?? raw.Id ?? raw.PK ?? raw.pk ?? null;
    if (!albumId) {
      return null;
    }

    const albumName = (raw.albumName ?? raw.name ?? raw.AlbumName ?? raw.Name ?? raw.fallbackName ?? 'Untitled album').toString();

    return { albumId, albumName };
  }
}
