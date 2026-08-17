export class OsmNode {
  constructor(
    public id: number,
    public lat: number,
    public lon: number,
    public tags: any
  ) {}
}
