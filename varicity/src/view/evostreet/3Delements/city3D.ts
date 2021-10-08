import { Config } from './../../../model/entitiesImplems/config.model';
import { VPVariantsImplem } from './../../../model/entitiesImplems/vpVariantsImplem.model';
import { Link } from '../../../model/entities/link.interface';
import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Building3D } from '../../common/3Delements/building3D';
import { Road3D } from './road3D';
import { EntitiesList } from '../../../model/entitiesList';
import { Link3DFactory } from '../../common/3Dfactory/link3D.factory';

export class City3D {

    config: Config;
    scene: Scene;

    road: Road3D;
    links: Link[] = [];

    floor: Mesh;

    constructor(config: Config, scene: Scene, entities: EntitiesList) {
        this.config = config;
        this.scene = scene;
        this.links = entities.links;
        this.init(entities);
    }

    private init(entities: EntitiesList) {

        let d3elem = new Road3D(this.scene, entities.district as VPVariantsImplem, this.config);
        this.road = d3elem;
    }

    private findSrcLink(name: string): Building3D {
        return this.road.get(name);
    }

    build() {
        this.config.clones = {
            map: new Map<string, {
                original: Building3D,
                clones: Building3D[]
            }>()
        };

        this.road.build(this.config);
        this.links.forEach(l => {
            let type = l.type;
            // if (type == "INSTANTIATE") { // we only want to show INSTANTIATE type links since the visualization is based off IMPLEMENTS & EXTENDS hierarchy
            let src = this.findSrcLink(l.source.name);
            let dest = this.findSrcLink(l.target.name);
            if (src !== undefined && dest !== undefined) {
                let link = Link3DFactory.createLink(src, dest, type, this.scene, this.config);
                if (link) {
                    src.link(link);
                    dest.link(link);
                    // src.link(dest, type);
                    //dest.link(src, type);
                }
            }
            // }
        });

        for (let [, value] of this.config.clones.map) {
            for (let b of value.clones) {
                if (b !== undefined) {
                    let link = Link3DFactory.createLink(value.original, b, "DUPLICATES", this.scene, this.config);
                    if (link) {
                        value.original.link(link);
                        b.link(link);
                        // value.original.link(b, "DUPLICATES");
                        //b.link(value.original, "DUPLICATES");
                    }
                }
            }
        }

        this.floor = MeshBuilder.CreateBox(
            "cityFloor",
            {
                height: 0.01,
                width: this.getSize(),
                depth: this.getSize()
            },
            this.scene);
    }

    getSize(): number {
        return Math.max(this.road.getSideWidth(true)*2, this.road.getSideWidth(false)*2, this.road.getLength());
    }

    place() {
        this.road.place(0, 0, 1, 0);
        this.floor.setPositionWithLocalVector(new Vector3(this.getSize() / 2, -0.01, 0));
    }

    render() {
        this.road.render(this.config);

        let mat = new StandardMaterial("FloorMat", this.scene);
        mat.ambientColor = Color3.FromHexString("#222222");
        mat.diffuseColor = Color3.FromHexString("#222222");
        mat.emissiveColor = Color3.FromHexString("#222222");
        mat.specularColor = Color3.FromHexString("#000000");
        mat.alpha = 0.3;
        this.floor.material = mat;
    }

}