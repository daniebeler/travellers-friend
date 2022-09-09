export class OsmNode {

    public id: number;
    public lat: number;
    public lon: number;
    public tags: any;

    constructor(node: any) {
        this.id = node.id;
        this.lat = node.lat;
        this.lon = node.lon;
        this.tags = node.tags;
    }
}
