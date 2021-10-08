export interface Node {
    name: string;
    types: string[];
    nbAttributes: number;
    nbFunctions: number;
    nbVariants: number;
    nbConstructorVariants: number;
    nbMethodVariants: number;
}

export class NodeElement implements Node{
    name: string;
    types: string[];
    nbAttributes: number;
    nbFunctions: number;
    nbVariants: number;
    nbConstructorVariants: number;
    nbMethodVariants: number;

    analyzed: boolean;
    root: boolean;
    compositionLevel: number = -1;
    origin: string = "";

    constructor(name: string) {
        this.name = name;
        this.analyzed = false;
        this.root = true;
    }
}