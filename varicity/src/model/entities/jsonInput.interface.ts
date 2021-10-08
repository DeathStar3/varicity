export interface NumerableInterface {
    name: string;
    number: number;
}

export interface NodeInterface {
    constructors: NumerableInterface[];
    types: string[];
    name: string;
    methods: NumerableInterface[];
    attributes: NumerableInterface[];

    interfaceAttributes?: NumerableInterface[];

    publicConstructors?: number;
    publicMethods?: number;
    constructorVPs?: number;

    constructorVariants?: number;
    methodVariants?: number;

    methodVPs?: number;

    allMethods?: number;

    nbComposition?: number;
}

export interface LinkInterface {
    type: string;
    source: string;
    target: string;
}

export interface JsonInputInterface {
    nodes: NodeInterface[];
    allnodes: NodeInterface[];
    links: LinkInterface[];
    linkscompose: LinkInterface[];
    alllinks: LinkInterface[];
}