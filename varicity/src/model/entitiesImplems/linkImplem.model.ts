import {Link} from "../entities/link.interface";
import {Building} from "../entities/building.interface";

export class LinkImplem extends Link {
    constructor(source: Building, target: Building, type: string) {
        super();
        this.source = source;
        this.target = target;
        this.type = type;
    }
}