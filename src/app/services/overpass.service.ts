import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OsmNode } from '../models/OsmNode';
import { ResponseAdapter } from '../adapter/response-adapter';
import geohash from 'ngeohash';
import { CategoryType } from '../models/Category';

const TIMEOUT = 10;

@Injectable({
  providedIn: 'root',
})
export class OverpassService {
  private readonly api = 'https://overpass-api.de/api/interpreter';

  constructor(
    private http: HttpClient,
    private responseAdapter: ResponseAdapter,
  ) {}

  private readonly CATEGORY_STATEMENTS: Record<CategoryType, string[]> = {
    toilets: ['"amenity"="toilets"'],
    water: ['"amenity"="drinking_water"', '"man_made"="water_tap"'],
    bike: ['"amenity"="bicycle_repair_station"'],
    atm: ['"amenity"="atm"', '"amenity"="bank"'],
    pingpong: ['"sport"="table_tennis"'],
    fitness: ['"leisure"="fitness_station"'],
  };

 getNodesByGeohash(
    geohashKey: string,
    categoryIds: CategoryType[],
  ): Observable<{ categoryId: CategoryType; nodes: OsmNode[] }[]> {
    const [south, west, north, east] = geohash.decode_bbox(geohashKey);

    const queryStatements = categoryIds
      .flatMap((id) => this.CATEGORY_STATEMENTS[id])
      .flatMap((stmt) => [`node[${stmt}];`, `way[${stmt}];`])
      .join('');

    const query = `[out:json][timeout:${TIMEOUT}][bbox:${south},${west},${north},${east}];(${queryStatements});out center;`;

    const body = new URLSearchParams();
    body.set('data', query);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<any>(this.api, query).pipe(
      map((data) => {
        const elements = data.elements || [];

        return categoryIds.map((id) => ({
          categoryId: id,
          nodes: elements
            .filter((el: any) => this.elementMatchesCategory(el, id))
            .map((el: any) => this.responseAdapter.adapt(el))
            .filter((node: any): node is OsmNode => node !== null),
        }));
      })
    );
  }

  private elementMatchesCategory(
    element: any,
    categoryId: CategoryType,
  ): boolean {
    const tags = element.tags || {};
    switch (categoryId) {
      case 'toilets':
        return tags.amenity === 'toilets';
      case 'water':
        return (
          tags.amenity === 'drinking_water' || tags.man_made === 'water_tap'
        );
      case 'bike':
        return tags.amenity === 'bicycle_repair_station';
      case 'atm':
        return tags.amenity === 'atm' || tags.amenity === 'bank';
      case 'pingpong':
        return tags.sport === 'table_tennis';
      case 'fitness':
        return tags.leisure === 'fitness_station';
    }
  }
}
