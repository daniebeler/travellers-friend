export class Node {

    public id: number;
    public lat: number;
    public lon: number;
    public tags: any;

    constructor(id: number, lat: number, lon: number, tags: any) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.tags = tags;
    }
}
