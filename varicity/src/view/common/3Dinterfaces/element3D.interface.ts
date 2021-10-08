import { Config } from './../../../model/entitiesImplems/config.model';
import { Mesh, Scene } from "@babylonjs/core";
import { Color } from "../../../model/entities/config.interface";

export abstract class Element3D {

    d3Model: Mesh;
    padding: number;
    scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    abstract getWidth(): number;

    abstract getLength(): number;

    abstract build(config?: Config): void;

    abstract place(x: number, z: number, orientationX?: number, orientationZ?: number): void;

    abstract render(config: Config): void;

    getColor(colorsList: Color[], types: string[]): string {
        for (let c of colorsList) {
            if (c.name.charAt(0) === "!" && !types.includes(c.name.substring(1))) {
                return c.color;
            }
            for (let type of types) {
                if (type == c.name) {
                    return c.color;
                }
            }
        }
        return undefined;
    }
}