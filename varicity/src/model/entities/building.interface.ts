import { Node } from './../../controller/parser/symfinder_elements/nodes/node.element';

export abstract class Building implements Node {
    name: string;
    types: string[];
    nbAttributes: number;
    nbFunctions: number;
    nbVariants: number;
    nbConstructorVariants: number;
    nbMethodVariants: number;

    width: number;
    height: number;

    // TODO: remove fullName to keep only building name

    compLevel: number;

    constructor() {
        this.types = [];
    }

    abstract getHeight(field: string): number;
    abstract getWidth(field: string): number;
}