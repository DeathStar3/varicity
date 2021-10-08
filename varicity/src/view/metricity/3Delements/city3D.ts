import { Link3DFactory } from './../../common/3Dfactory/link3D.factory';
import { Config } from './../../../model/entitiesImplems/config.model';
import { Link } from '../../../model/entities/link.interface';
import { Scene } from '@babylonjs/core';
import { Element3D } from '../../common/3Dinterfaces/element3D.interface';
import { Building3D } from '../../common/3Delements/building3D';
import { District3D } from './district3D';
import { EntitiesList } from '../../../model/entitiesList';

export class City3D {

    config: Config;
    scene: Scene;

    districts: District3D[] = [];
    buildings: Building3D[] = [];
    links: Link[] = [];

    constructor(config: Config, scene: Scene, entities: EntitiesList) {
        this.config = config;
        this.scene = scene;
        this.links = entities.links;
        this.init(entities);
    }

    private init(entities: EntitiesList) {

        let d3elem = new District3D(this.scene, entities.district, 0);
        this.districts.push(d3elem);

        entities.buildings.forEach(b => {
            let d3elem = new Building3D(this.scene, b, 0, this.config);
            this.buildings.push(d3elem);
            // d3elem.build();
            // d3elem.render(this.config);
        });
    }

    private findSrcLink(name: string): Building3D {
        let building: Building3D = undefined;
        for (let b of this.buildings) {
            if (b.getName() == name) return building = b;
        }
        for (let d of this.districts) {
            let b = d.get(name);
            if (b != undefined) return building = b;
        }
        return building;
    }

    build() {
        this.districts.forEach(d => {
            d.build(this.config);
        });
        this.buildings.forEach(b => {
            b.build();
        });
        this.links.forEach(l => {
            let src = this.findSrcLink(l.source.name);
            let dest = this.findSrcLink(l.target.name);
            let type = l.type;
            if (src != undefined && dest != undefined) {
                let link = Link3DFactory.createLink(src, dest, type, this.scene, this.config);
                if (link) {
                    src.link(link);
                    dest.link(link);
                    // src.link(dest, type);
                    // dest.link(src, type);
                }
            }
        });

        this.place();
    }

    getWidth(): number {
        return this.districts.reduce<number>((prev, cur) => prev += cur.getWidth(), 0);
    }

    getLength(): number {
        return this.getWidth();
    }

    place() {
        let d3elements: Element3D[] = [];
        d3elements = d3elements.concat(this.buildings, this.districts);
        d3elements = d3elements.sort((a, b) => a.getWidth() - b.getWidth());
        let currentX: number = 0;
        let size = this.getWidth();
        d3elements.forEach(e => {
            let eSize = e.getWidth();
            // e.place(x + currentX, z + currentZ);
            // currentX += eSize;
            e.place(currentX + (eSize - size) / 2, 0);
            currentX += eSize;
        });
    }

    render() {
        this.districts.forEach(d => {
            d.render(this.config);
        });
        this.buildings.forEach(b => {
            b.render();
        })
    }

}