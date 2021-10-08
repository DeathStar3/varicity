import { Config } from './../../../model/entitiesImplems/config.model';
import { ActionManager, Color3, Color4, ExecuteCodeAction, MeshBuilder, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Element3D } from '../../common/3Dinterfaces/element3D.interface';
import { Building3D } from '../../common/3Delements/building3D';
import { Scene } from '@babylonjs/core';
import { VPVariantsImplem } from "../../../model/entitiesImplems/vpVariantsImplem.model";

export class Road3D extends Element3D {
    padding: number = 0;

    elementModel: VPVariantsImplem;

    leftVPs: Road3D[] = [];
    rightVPs: Road3D[] = [];

    leftVariants: Building3D[] = [];
    rightVariants: Building3D[] = [];

    vp: Building3D;

    vector: Vector3;

    orientationX: number;
    orientationZ: number;

    roadWidth = 0.3;

    status: boolean = false;

    constructor(scene: Scene, vpElmt: VPVariantsImplem, config: Config) {
        super(scene);

        this.elementModel = vpElmt;
        if (vpElmt.vp) {
            this.vp = new Building3D(scene, vpElmt.vp, 0, config);
        }

        this.padding = config.district.padding;
    }

    private spreadElementsVariants(elements: Building3D[], left: Building3D[], right: Building3D[]): void {
        if (elements.length > 0) {
            const sorted = elements.sort((a, b) => {
                return (b.getWidth() - a.getWidth()) !== 0 ? b.getWidth() - a.getWidth() : (
                    b.getHeight() - a.getHeight()
                );
            });
            sorted.forEach((e) => {
                if (this.sumOfWidths(left) > this.sumOfWidths(right)) {
                    right.push(e);
                } else {
                    left.push(e);
                }
            });
        }
    }

    private spreadElementsVP(elements: Road3D[], left: Road3D[], right: Road3D[]): void {
        if (elements.length > 0) {
            //const sorted = elements.sort((a, b) => b.getWidth() - a.getWidth());
            // let i = 0;
            // while (i < sorted.length && this.sumOfWidths(sorted) / 2 > this.sumOfWidths(left)) {
            //     left.push(sorted[i]);
            //     i++;
            // }
            // sorted.slice(i).forEach(e => {
            //     right.push(e);
            // });
            const sorted = elements.sort((a, b) => {
                return (b.getWidth() - a.getWidth()) !== 0 ? b.getWidth() - a.getWidth() : (
                    (b.getLength() - a.getLength()) !== 0 ? b.getLength() - a.getLength() : (
                        b.getHeight() - a.getHeight()
                    )
                );
            });
            sorted.forEach((e) => {
                if (this.sumOfWidths(left) > this.sumOfWidths(right)) {
                    right.push(e);
                } else {
                    left.push(e);
                }
            });
        }
    }

    private sumOfWidths(list: Element3D[]): number {
        return list.reduce<number>((prev, cur) => prev += cur.getWidth(), 0);
    }

    /**
     * 
     * @param right right side = true, left side = false
     * 
     * @returns the width of the side
     */
    getSideWidth(right: boolean): number {
        if (right) { // right
            return Math.max(
                this.rightVPs.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.rightVariants.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.getVpWidth() / 2
            );
        } else { // left
            return Math.max(
                this.leftVPs.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.leftVariants.reduce(((a, b) => Math.max(a, b.getLength())), 0),
                this.getVpWidth() / 2
            );
        }
    }

    getVpWidth(): number {
        return this.vp === undefined ? 0 : this.vp.getWidth();
    }

    getVpHeight(): number {
        return this.vp === undefined ? 0 : this.vp.getHeight();
    }

    getVpPadding(): number {
        return this.vp === undefined ? 0 : this.vp.padding;
    }

    getWidth(): number {
        return this.getSideWidth(true) + this.getSideWidth(false) + this.padding;
    }

    getLength(): number {
        return Math.max(
            this.leftVariants.reduce(((a, b) => a + b.getWidth()), 0),
            this.rightVariants.reduce(((a, b) => a + b.getWidth()), 0)
        ) + Math.max(
            this.leftVPs.reduce(((a, b) => a + b.getWidth()), 0),
            this.rightVPs.reduce(((a, b) => a + b.getWidth()), 0)
        ) + (this.getVpWidth()) + this.padding;
    }

    getHeight(): number {
        return Math.max(
            this.leftVPs.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            this.rightVPs.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            this.rightVariants.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            this.leftVariants.reduce((a, b) => Math.max(a, b.getHeight()), 0),
            (this.vp === undefined ? 0 : this.vp.getHeight())
        )
    }

    get(name: string): Building3D {
        let building: Building3D = undefined;
        if (this.vp && this.vp.getName() === name) return this.vp;
        const arrConcat = this.leftVariants.concat(this.rightVariants);
        for (let b of arrConcat) {
            if (b.getName() == name) {
                return building = b;
            }
        }
        const roadsConcat = this.leftVPs.concat(this.rightVPs);
        for (let d of roadsConcat) {
            let b = d.get(name);
            if (b != undefined) {
                return building = b;
            }
        }
        return building;
    }

    build(config?: Config) {
        const buildings3D: Building3D[] = [];
        if (this.vp) this.vp.build();
        this.elementModel.buildings.forEach(b => {
            if (config.blacklist) {
                // if (!config.blacklist.includes(b.name)) {
                if (!config.blacklist.some(blacklisted => b.name.includes(blacklisted))) {
                    if (config.clones) {
                        if (config.clones.map.has(b.name)) {
                            config.clones.map.get(b.name).clones.push(this.vp);
                        } else {
                            let d3 = new Building3D(this.scene, b, 0, config);
                            config.clones.map.set(b.name, { original: d3, clones: [] });
                            d3.build();
                            buildings3D.push(d3);
                        }
                    } else {
                        let d3 = new Building3D(this.scene, b, 0, config);
                        d3.build();
                        buildings3D.push(d3);
                    }
                }
            }
        });
        const roads3D: Road3D[] = [];
        this.elementModel.districts.forEach(v => {
            if (config.blacklist) {
                // if (!config.blacklist.includes(v.name)) {
                if (!config.blacklist.some(blacklisted => v.name.includes(blacklisted))) {
                    if (config.clones) {
                        if (config.clones.map.has(v.vp.name)) {
                            config.clones.map.get(v.vp.name).clones.push(this.vp);
                        } else {
                            let d3 = new Road3D(this.scene, v, config);
                            config.clones.map.set(v.vp.name, { original: d3.vp, clones: [] });
                            d3.build(config);
                            roads3D.push(d3);
                        }
                    } else {
                        let d3 = new Road3D(this.scene, v, config);
                        d3.build(config);
                        roads3D.push(d3);
                    }
                }
            }
        });

        this.spreadElementsVariants(buildings3D, this.leftVariants, this.rightVariants);
        this.spreadElementsVP(roads3D, this.leftVPs, this.rightVPs);
    }

    getRoadLength(): number {
        return this.getLength() - this.getVpWidth();
    }

    place(x: number, z: number, orientationX: number, orientationZ: number) {
        this.orientationX = orientationX;
        this.orientationZ = orientationZ;

        if (this.vp) this.vp.place(x, z);

        this.vector = new Vector3(
            x + orientationX * (this.getRoadLength() / 2 + this.getVpWidth() / 2 - this.getVpPadding() / 2),
            0,
            z + orientationZ * (this.getRoadLength() / 2 + this.getVpWidth() / 2 - this.getVpPadding() / 2)
        );

        let offsetVL = this.getVpWidth() / 2; // to start drawing VPs
        let offsetVR = this.getVpWidth() / 2;
        this.leftVPs.forEach(e => {
            let vX =
                /* horizontal case: */ (e.getSideWidth(false) + offsetVL) * orientationX +
                /* vertical case:   */ (e.getVpWidth() / 2 - e.vp.padding / 2 + this.roadWidth / 2) * -orientationZ;
            let vZ =
                /* horizontal case: */ (e.getVpWidth() / 2 - e.vp.padding / 2 + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ (e.getSideWidth(false) + offsetVL) * orientationZ;
            e.place(vX + x, vZ + z, -orientationZ, orientationX);
            offsetVL += e.getWidth();
        });
        this.rightVPs.forEach(e => {
            let vX =
                /* horizontal case: */ (e.getSideWidth(true) + offsetVR) * orientationX +
                /* vertical case:   */ (e.getVpWidth() / 2 - e.vp.padding / 2 + this.roadWidth / 2) * orientationZ;
            let vZ =
                /* horizontal case: */ - (e.getVpWidth() / 2 - e.vp.padding / 2 + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ (e.getSideWidth(true) + offsetVR) * orientationZ;
            e.place(vX + x, vZ + z, orientationZ, -orientationX);
            offsetVR += e.getWidth();
        });

        let offsetL = Math.max(offsetVL, offsetVR);;
        let offsetR = Math.max(offsetVL, offsetVR);;

        this.leftVariants.forEach(e => {
            let vX =
                /* horizontal case: */ ((e.getWidth() / 2) + offsetL) * orientationX +
                /* vertical case:   */ (e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * -orientationZ;
            let vZ =
                /* horizontal case: */ (e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ (e.getWidth() / 2 + offsetL) * orientationZ
            e.place(vX + x, vZ + z);
            offsetL += e.getWidth();
        });

        this.rightVariants.forEach(e => {
            let vX =
                /* horizontal case: */ ((e.getWidth() / 2) + offsetR) * orientationX -
                /* vertical case:   */ (e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * -orientationZ;
            let vZ =
                /* horizontal case: */ - (e.getWidth() / 2 - e.padding / 2 + this.roadWidth / 2) * orientationX +
                /* vertical case:   */ ((e.getWidth()) / 2 + offsetR) * orientationZ
            e.place(vX + x, vZ + z);
            offsetR += e.getWidth();
        });
    }

    render(config: Config) {
        this.d3Model = MeshBuilder.CreateBox(
            this.elementModel.name,
            {
                height: 0.001,
                width: (this.orientationX == 0 ? this.roadWidth : this.getRoadLength()),
                depth: (this.orientationZ == 0 ? this.roadWidth : this.getRoadLength())
            },
            this.scene);
        this.d3Model.setPositionWithLocalVector(this.vector);

        let mat = new StandardMaterial("District", this.scene);
        // if config -> district -> colors -> faces is defined
        if (config.district.colors.faces) {
            if (this.vp) {
                const vPColors = config.district.colors.faces.filter(c => c.name === "VP");
                if (vPColors.length > 0) {
                    mat.ambientColor = Color3.FromHexString(vPColors[0].color);
                    mat.diffuseColor = Color3.FromHexString(vPColors[0].color);
                    mat.emissiveColor = Color3.FromHexString(vPColors[0].color);
                    mat.specularColor = Color3.FromHexString("#000000");
                } else {
                    const defaultVPColor = "#FFFFFF";
                    mat.ambientColor = Color3.FromHexString(defaultVPColor);
                    mat.diffuseColor = Color3.FromHexString(defaultVPColor);
                    mat.emissiveColor = Color3.FromHexString(defaultVPColor);
                    mat.specularColor = Color3.FromHexString("#000000");
                }
            } else {
                const pacColors = config.district.colors.faces.filter(c => c.name === "PACKAGE");
                if (pacColors.length > 0) {
                    mat.ambientColor = Color3.FromHexString(pacColors[0].color);
                    mat.diffuseColor = Color3.FromHexString(pacColors[0].color);
                    mat.emissiveColor = Color3.FromHexString(pacColors[0].color);
                    mat.specularColor = Color3.FromHexString("#000000");
                } else {
                    const defaultPacColor = "#000000";
                    mat.ambientColor = Color3.FromHexString(defaultPacColor);
                    mat.diffuseColor = Color3.FromHexString(defaultPacColor);
                    mat.emissiveColor = Color3.FromHexString(defaultPacColor);
                    mat.specularColor = Color3.FromHexString("#000000");
                }
            }
        }

        this.d3Model.material = mat;

        if (this.vp) this.vp.render();

        const variants = this.leftVariants.concat(this.rightVariants);
        variants.forEach(d => {
            d.render();
        });

        const vps = this.leftVPs.concat(this.rightVPs);
        vps.forEach(b => {
            b.render(config);
        });

        this.d3Model.actionManager = new ActionManager(this.scene);
        this.d3Model.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnLeftPickTrigger
                },
                () => {
                    this.showAllLinks();
                }
            )
        );
    }

    showAllLinks(status?: boolean) {
        if (status) this.status = status;
        else this.status = !this.status;
        if (this.vp) this.vp.showAllLinks(this.status);

        const variants = this.leftVariants.concat(this.rightVariants);
        variants.forEach(v => {
            v.showAllLinks(this.status);
        });

        const vps = this.leftVPs.concat(this.rightVPs);
        vps.forEach(vp => {
            vp.showAllLinks(this.status);
        });
    }
}