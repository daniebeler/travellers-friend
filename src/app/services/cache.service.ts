import { Injectable } from '@angular/core';
import { OsmNode } from '../models/OsmNode';
import { CategoryType } from '../models/Category';

interface CacheEntry {
  nodes: OsmNode[];
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly CACHE_TTL = 1000 * 60 * 60 * 24; // 24 Stunden TTL
  private readonly STORAGE_PREFIX = 'osm_cache_';
  private inMemoryCache = new Map<string, CacheEntry>();

  private getStorageKey(geohash: string, category: CategoryType): string {
    return `${this.STORAGE_PREFIX}${geohash}_${category}`;
  }

  /**
   * Liest gekapselte Daten für einen bestimmten Geohash und eine Kategorie aus.
   */
  get(geohash: string, category: CategoryType): OsmNode[] | null {
    const key = this.getStorageKey(geohash, category);

    // 1. In-Memory Prüfung
    if (this.inMemoryCache.has(key)) {
      const entry = this.inMemoryCache.get(key)!;
      if (this.isValid(entry.timestamp)) return entry.nodes;
      this.inMemoryCache.delete(key);
    }

    // 2. LocalStorage Prüfung
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry = JSON.parse(raw);
      if (this.isValid(entry.timestamp)) {
        this.inMemoryCache.set(key, entry); // Sync in den RAM
        return entry.nodes;
      }

      this.remove(geohash, category);
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Speichert Knoten für eine bestimmte Kategorie in einem Geohash.
   */
  set(geohash: string, category: CategoryType, nodes: OsmNode[]): void {
    const key = this.getStorageKey(geohash, category);
    const entry: CacheEntry = { nodes, timestamp: Date.now() };

    this.inMemoryCache.set(key, entry);

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn('LocalStorage full, clearing old cache entries', e);
      this.clearExpired();
    }
  }

  /**
   * Prüft ein Set von Kategorien für einen Geohash.
   * Gibt gekapselte Knoten zurück und listet die Kategorien auf, die noch per API nachgeladen werden müssen.
   */
  getAvailableAndMissing(
    geohash: string,
    requestedCategories: CategoryType[]
  ): {
    cached: { categoryId: CategoryType; nodes: OsmNode[] }[];
    missing: CategoryType[];
  } {
    const cached: { categoryId: CategoryType; nodes: OsmNode[] }[] = [];
    const missing: CategoryType[] = [];

    for (const cat of requestedCategories) {
      const nodes = this.get(geohash, cat);
      if (nodes !== null) {
        cached.push({ categoryId: cat, nodes });
      } else {
        missing.push(cat);
      }
    }

    return { cached, missing };
  }

  private remove(geohash: string, category: CategoryType): void {
    const key = this.getStorageKey(geohash, category);
    this.inMemoryCache.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  private isValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private clearExpired(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const entry: CacheEntry = JSON.parse(raw);
            if (!this.isValid(entry.timestamp)) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch {}
  }
}
