import { Link3D } from '../3Dinterfaces/link3D.interface';
import { Config } from '../../../model/entitiesImplems/config.model';
import { Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Building3D } from './building3D';
import { D3Utils } from "../3D.utils";

export class UndergroundRoad3DImplem implements Link3D {
    scene: Scene;

    src: Building3D;
    dest: Building3D
    type: string;

    downRoadMesh: Mesh;
    roadMesh: Mesh

    force: boolean = false;

    config: Config;

    destroyed: boolean;

    constructor(src: Building3D, dest: Building3D, type: string, scene: Scene, config: Config) {
        this.src = src;
        this.dest = dest;
        this.type = type;
        this.scene = scene;
        this.config = config;
    }

    render(bool: boolean): void {
        if (!bool) {
            this.downRoadMesh.dispose(false, true);
            delete this.downRoadMesh;
            this.roadMesh.dispose(false, true);
            delete this.roadMesh;
            return;
        }
        const underGroundBuildingHeight = Math.abs(this.src.elementModel.compLevel - 1 - this.dest.elementModel.compLevel);
        const underGroundBuildingWidth = 0.3;
        this.downRoadMesh = MeshBuilder.CreateBox("downRoad", {
            width: underGroundBuildingWidth,
            height: 0.001,
            depth: underGroundBuildingHeight
        }, this.scene);

        let midBox: Vector3 = this.src.bot.add(new Vector3(0, - underGroundBuildingHeight / 2, 0))
        let botBox: Vector3 = midBox.add(new Vector3(0, - underGroundBuildingHeight / 2, 0));
        this.downRoadMesh.setPositionWithLocalVector(midBox);

        D3Utils.facePoint(this.downRoadMesh, new Vector3(this.dest.bot.x, - underGroundBuildingHeight / 2, this.dest.bot.z));

        const roadLength = Vector3.Distance(botBox, this.dest.bot);
        this.roadMesh = MeshBuilder.CreateBox("road", {
            width: underGroundBuildingWidth,
            height: roadLength,
            depth: 0.001
        }, this.scene);
        this.roadMesh.setPositionWithLocalVector(new Vector3(
            botBox.x + (this.dest.bot.x - botBox.x) / 2,
            botBox.y + (this.dest.bot.y - botBox.y) / 2,
            botBox.z + (this.dest.bot.z - botBox.z) / 2
        ));

        D3Utils.facePoint(this.roadMesh, new Vector3(this.dest.bot.x, this.dest.bot.y, this.dest.bot.z));

        let mat = new StandardMaterial(this.downRoadMesh.name + "Mat", this.scene);
        if (this.config.link.colors) {
            for (let c of this.config.link.colors) {
                if (c.name == this.type) {
                    mat.ambientColor = Color3.FromHexString(c.color);
                    mat.diffuseColor = Color3.FromHexString(c.color);
                    mat.emissiveColor = Color3.FromHexString(c.color);
                    mat.specularColor = Color3.FromHexString(c.color);
                    mat.alpha = 1;
                    mat.backFaceCulling = false;
                    this.downRoadMesh.material = mat;
                    this.roadMesh.material = mat;
                    return;
                }
            }
        }
    }

    // render(config: Config): void {
    //     const underGroundBuildingHeight = Math.abs(this.src.elementModel.compLevel - 1 - this.dest.elementModel.compLevel);
    //     const underGroundBuildingWidth = 0.3;
    //     this.downRoadMesh = MeshBuilder.CreateBox("downRoad", {
    //         width: underGroundBuildingWidth,
    //         height: 0.001,
    //         depth: underGroundBuildingHeight
    //     }, this.scene);

    //     let midBox: Vector3 = this.src.bot.add(new Vector3(0, - underGroundBuildingHeight / 2, 0))
    //     let botBox: Vector3 = midBox.add(new Vector3(0, - underGroundBuildingHeight / 2, 0));
    //     this.downRoadMesh.setPositionWithLocalVector(midBox);

    //     D3Utils.facePoint(this.downRoadMesh, new Vector3(this.dest.bot.x, - underGroundBuildingHeight / 2, this.dest.bot.z));

    //     const roadLength = Vector3.Distance(botBox, this.dest.bot);
    //     this.roadMesh = MeshBuilder.CreateBox("road", {
    //         width: underGroundBuildingWidth,
    //         height: roadLength,
    //         depth: 0.001
    //     }, this.scene);
    //     this.roadMesh.setPositionWithLocalVector(new Vector3(
    //         botBox.x + (this.dest.bot.x - botBox.x) / 2,
    //         botBox.y + (this.dest.bot.y - botBox.y) / 2,
    //         botBox.z + (this.dest.bot.z - botBox.z) / 2
    //     ));

    //     D3Utils.facePoint(this.roadMesh, new Vector3(this.dest.bot.x, this.dest.bot.y, this.dest.bot.z));

    //     // let pts: Vector3[] = [];
    //     //
    //     // pts.push(
    //     //     this.dest.bot,
    //     //     botBox.add(new Vector3(- underGroundBuildingWidth / 2, 0, - underGroundBuildingWidth / 2)),
    //     //     botBox.add(new Vector3(underGroundBuildingWidth / 2, 0, - underGroundBuildingWidth / 2)),
    //     //     botBox.add(new Vector3(underGroundBuildingWidth / 2, 0, underGroundBuildingWidth / 2)),
    //     //     botBox.add(new Vector3(- underGroundBuildingWidth / 2, 0, underGroundBuildingWidth / 2)),
    //     //     botBox.add(new Vector3(- underGroundBuildingWidth / 2, 0, - underGroundBuildingWidth / 2)),
    //     //     this.dest.bot
    //     // );
    //     //
    //     // this.polyhedron = MeshBuilder.CreateRibbon("ribbon", { pathArray: [pts], closeArray: true, closePath: false }, this.scene);

    //     // this.polyhedron = MeshBuilder.CreatePolyhedron("polyhedron", {
    //     //     type: 5,
    //     //     sizeX: this.src.getWidth() / 2,
    //     //     sizeZ: this.src.getLength() / 2,
    //     //     sizeY: 1
    //     // }, 
    //     // this.scene);
    //     // this.polyhedron.setPositionWithLocalVector(botBox);

    //     this.downRoadMesh.visibility = 0; // defaults at hidden
    //     this.roadMesh.visibility = 0;

    //     let mat = new StandardMaterial(this.downRoadMesh.name + "Mat", this.scene);
    //     if (config.link.colors) {
    //         for (let c of config.link.colors) {
    //             if (c.name == this.type) {
    //                 mat.ambientColor = Color3.FromHexString(c.color);
    //                 mat.diffuseColor = Color3.FromHexString(c.color);
    //                 mat.emissiveColor = Color3.FromHexString(c.color);
    //                 mat.specularColor = Color3.FromHexString(c.color);
    //                 mat.alpha = 1;
    //                 mat.backFaceCulling = false;
    //                 this.downRoadMesh.material = mat;
    //                 this.roadMesh.material = mat;
    //                 return;
    //             }
    //         }
    //     }
    // }

    display(force?: boolean, show?: boolean): void {
        if (force != undefined) this.force = force;
        // if (!this.force && this.downRoadMesh.visibility == 1) {
        if (!show && !this.force && this.downRoadMesh) {
            // this.roadMesh.visibility = 0;
            // this.downRoadMesh.visibility = 0;
            this.render(false);
            this.destroyed = true;
        } else {
            if (show && ((force == undefined || this.force) && !this.downRoadMesh)) {
                this.render(true);
                // this.downRoadMesh.visibility = 1;
                // this.roadMesh.visibility = 1;
            }
        }
    }
}