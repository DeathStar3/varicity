import { Building3D } from '../../view/common/3Delements/building3D';
import { Orientation } from "../entitiesImplems/orientation.enum";

export interface Color {
    name: string;
    color: string; // HEX COLOR string
}

export interface ConfigColor {
    // colors: {
        edges: Color[], // HEX color string
        faces: Color[],
        outlines: Color[]
    // }
}

export interface D3Config {
    padding: number;
    colors: ConfigColor;
}

export interface ConfigClones {
    map: Map<string, {
        original: Building3D,
        clones: Building3D[]
    }>
}

export interface ConfigInterface {
    building: D3Config;
    // building: ConfigColor;
    district: D3Config;
    // district: ConfigColor;
    link: {
        colors: Color[],
        display: {
            air_traffic: string[],
            underground_road: string[],
        }
    };

    vp_building: {
        color: string; // HEX color string
    }

    hierarchy_links: string[];

    blacklist: string[]; //all classes that must not appear
    api_classes: Map<string, string[]>;

    clones: ConfigClones;

    force_color: string; // HEX color string

    variables: {
        width: string,
        height: string,
    }

    orientation: Orientation;

    default_level: number;
}