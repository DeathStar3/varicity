
export class LinkElement {
    public source: string;
    public target: string;
    public type: string;

    constructor(source: string, target: string, type: string) {
        this.source = source;
        this.target = target;
        this.type = type;
    }
}