import { UIController } from './../../../controller/ui/ui.controller';
import { Config } from './../../../model/entitiesImplems/config.model';
import { Element3D } from '../3Dinterfaces/element3D.interface';
import {
    ActionManager,
    Color3,
    Color4,
    ExecuteCodeAction,
    HighlightLayer,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Vector3
} from '@babylonjs/core';
import { Building } from '../../../model/entities/building.interface';
import { Link3D } from '../3Dinterfaces/link3D.interface';

export class Building3D extends Element3D {
    elementModel: Building;

    depth: number;

    center: Vector3;
    top: Vector3;
    bot: Vector3;

    d3ModelOutline: Mesh;
    d3ModelPyramid: Mesh = undefined;
    d3ModelChimney1: Mesh = undefined;
    d3ModelChimney2: Mesh = undefined;
    d3ModelChimney3: Mesh = undefined;
    d3ModelPrism: Mesh = undefined;
    d3ModelInvertedPyramid: Mesh = undefined;
    d3ModelSphere: Mesh = undefined;

    links: Link3D[] = [];

    padding = 0.2;
    heightScale = 0.3;
    outlineWidth = 0.05;

    edgesWidth: number = 7.0;

    highlightLayer: HighlightLayer;
    highlightForce: boolean;

    config: Config;

    flag: boolean = false;

    constructor(scene: Scene, buildingElement: Building, depth: number, config: Config) {
        super(scene);
        this.elementModel = buildingElement;
        this.depth = depth;
        this.config = config;
        this.padding = config.building.padding;
    }

    showAllLinks(status?: boolean) {
        if (status == undefined) this.links.forEach(l => l.display());
        else this.links.forEach(l => l.display(status));
    }

    getWidth(): number {
        return this.elementModel.getWidth(this.config.variables.width) + this.padding; // 2.5 av 2.5 ap
        // return this.elementModel.getWidth();// 2.5 av 2.5 ap
    }

    getLength(): number {
        return this.getWidth();
    }

    getHeight(): number {
        return this.elementModel.getHeight(this.config.variables.height) * this.heightScale;
    }

    getName() {
        return this.elementModel.name;
    }

    link(link: Link3D) {
        this.links.push(link);
    }

    highlight(arg: boolean, force: boolean = false) {
        if (force) this.highlightForce = arg;
        if (!arg && !this.highlightForce) {
            this.highlightLayer.removeAllMeshes();
            // this.highlightLayer.dispose();
            // delete this.highlightLayer;
        } else {
            // if (this.highlightLayer) this.highlightLayer.removeAllMeshes();
            this.highlightLayer.addMesh(this.d3Model, Color3.Blue());
        }
    }

    focus() {
        let cam = UIController.scene.camera;
        cam.focusOn([this.d3Model], true);
        cam.radius = 20;
    }

    build() {
    }

    place(x: number, z: number) {
        const increaseHeight = ["API", "FACTORY", "DECORATOR", "TEMPLATE", "STRATEGY"];
        let halfHeight = this.getHeight() / 2;
        this.center = new Vector3(x, halfHeight + this.depth * 30, z);
        this.bot = this.center.add(new Vector3(0, -halfHeight, 0));
        // if (this.elementModel.types.includes("API")) {
        //     halfHeight += this.getWidth() - this.padding;
        // }
        this.elementModel.types.forEach(t => {
            if (increaseHeight.includes(t)) {
                halfHeight += this.getWidth() - this.padding;
            }
        });
        this.top = this.center.add(new Vector3(0, halfHeight, 0));
    }

    render() {
        // Display building
        this.d3Model = MeshBuilder.CreateBox(
            this.elementModel.name,
            {
                height: this.getHeight(),
                width: this.elementModel.getWidth(this.config.variables.width),
                depth: this.elementModel.getWidth(this.config.variables.width)
            },
            this.scene);
        this.d3Model.setPositionWithLocalVector(this.center);

        this.highlightLayer = new HighlightLayer("hl", this.scene);

        // if config -> building -> colors -> outline is defined
        if (this.config.building.colors.outlines) {
            const outlineColor = this.getColor(this.config.building.colors.outlines, this.elementModel.types);
            if (outlineColor !== undefined) {
                this.d3ModelOutline = MeshBuilder.CreateBox(
                    this.elementModel.name,
                    {
                        height: this.getHeight() + this.outlineWidth,
                        width: this.elementModel.getWidth(this.config.variables.width) + this.outlineWidth,
                        depth: this.elementModel.getWidth(this.config.variables.width) + this.outlineWidth,
                        sideOrientation: Mesh.BACKSIDE,
                        updatable: false
                    },
                    this.scene);
                let outlineMat = new StandardMaterial('outlineMaterial', this.scene);
                this.d3ModelOutline.material = outlineMat;
                this.d3ModelOutline.parent = this.d3Model;
                outlineMat.diffuseColor = Color3.FromHexString(outlineColor);
                outlineMat.emissiveColor = Color3.FromHexString(outlineColor);
            } else {
                this.d3Model.renderOutline = false;
            }
        } else {
            this.d3Model.renderOutline = false;
        }

        let mat = new StandardMaterial(this.elementModel.name + "Mat", this.scene);
        if (this.config.force_color) {
            mat.ambientColor = Color3.FromHexString(this.config.force_color);
            mat.diffuseColor = Color3.FromHexString(this.config.force_color);
            mat.emissiveColor = Color3.FromHexString(this.config.force_color);
            mat.specularColor = Color3.FromHexString("#000000");
        } else {
            if (this.config.building.colors.faces) {
                const buildingColor = this.getColor(this.config.building.colors.faces, this.elementModel.types);
                if (buildingColor !== undefined) {
                    mat.ambientColor = Color3.FromHexString(buildingColor);
                    mat.diffuseColor = Color3.FromHexString(buildingColor);
                    mat.emissiveColor = Color3.FromHexString(buildingColor);
                    mat.specularColor = Color3.FromHexString("#000000");
                } else {
                    mat.ambientColor = new Color3(1, 0, 0);
                    mat.diffuseColor = new Color3(1, 0, 0);
                    mat.emissiveColor = new Color3(1, 0, 0);
                    mat.specularColor = new Color3(0, 0, 0);
                }
            } else {
                mat.ambientColor = new Color3(1, 0, 0);
                mat.diffuseColor = new Color3(1, 0, 0);
                mat.emissiveColor = new Color3(1, 0, 0);
                mat.specularColor = new Color3(0, 0, 0);
            }
        }

        this.d3Model.material = mat;

        let offSet = 0;

        // draw sphere for decorator
        if (this.elementModel.types.includes("DECORATOR")) {
            this.d3ModelSphere = MeshBuilder.CreateSphere("sphere", {
                diameter: (this.getWidth() - this.padding),
            }, this.scene);
            this.d3ModelSphere.setPositionWithLocalVector(this.center.add(new Vector3(0, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelSphere.material = mat;
            this.d3ModelSphere.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelSphere], true);
        }

        // draw reversed pyramid for template
        if (this.elementModel.types.includes("TEMPLATE")) {
            this.d3ModelInvertedPyramid = MeshBuilder.CreateCylinder("reversedPyramid", {
                diameterTop: 0,
                tessellation: 4,
                diameterBottom: this.getWidth() - this.padding,
                height: this.getWidth() - this.padding
            }, this.scene);
            this.d3ModelInvertedPyramid.setPositionWithLocalVector(this.center.add(new Vector3(0, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelInvertedPyramid.rotate(new Vector3(1, 0, 0), Math.PI);
            this.d3ModelInvertedPyramid.rotate(new Vector3(0, 1, 0), Math.PI / 4);
            this.d3ModelInvertedPyramid.material = mat;
            this.d3ModelInvertedPyramid.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelInvertedPyramid], true);
        }

        // draw 16 faced prism for strategy
        if (this.elementModel.types.includes("STRATEGY")) {
            this.d3ModelPrism = MeshBuilder.CreateCylinder("prism", {
                tessellation: 8,
                diameter: (this.getWidth() - this.padding),
                height: this.getWidth() - this.padding
            }, this.scene);
            this.d3ModelPrism.setPositionWithLocalVector(this.center.add(new Vector3(0, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelPrism.material = mat;
            this.d3ModelPrism.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelPrism], true);
        }

        // draw chimney for factories
        if (this.elementModel.types.includes("FACTORY")) {
            this.d3ModelChimney1 = MeshBuilder.CreateCylinder("chimney1", {
                diameter: (this.getWidth() - this.padding) / 6,
                height: this.getWidth() - this.padding
            }, this.scene);
            this.d3ModelChimney2 = MeshBuilder.CreateCylinder("chimney2", {
                diameter: (this.getWidth() - this.padding) / 6,
                height: this.getWidth() - this.padding
            }, this.scene);
            this.d3ModelChimney3 = MeshBuilder.CreateCylinder("chimney3", {
                diameter: (this.getWidth() - this.padding) / 6,
                height: this.getWidth() - this.padding
            }, this.scene);
            this.d3ModelChimney1.setPositionWithLocalVector(this.center.add(new Vector3(- ((this.getWidth() - this.padding) / 2) * 10 / 12, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelChimney2.setPositionWithLocalVector(this.center.add(new Vector3(0, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelChimney3.setPositionWithLocalVector(this.center.add(new Vector3(((this.getWidth() - this.padding) / 2) * 10 / 12, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2, 0)));
            this.d3ModelChimney1.material = mat;
            this.d3ModelChimney2.material = mat;
            this.d3ModelChimney3.material = mat;
            this.d3ModelChimney1.material.backFaceCulling = false;
            this.d3ModelChimney2.material.backFaceCulling = false;
            this.d3ModelChimney3.material.backFaceCulling = false;
            offSet += this.getWidth() - this.padding;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelChimney1, this.d3ModelChimney2, this.d3ModelChimney3], true);
        }

        // draw top pyramid if API class
        if (this.elementModel.types.includes("API")) {
            this.d3ModelPyramid = MeshBuilder.CreateCylinder("pyramid", {
                diameterTop: 0,
                tessellation: 4,
                diameterBottom: this.getWidth() - this.padding,
                height: this.getWidth() - this.padding
            }, this.scene);
            this.d3ModelPyramid.setPositionWithLocalVector(this.center.add(new Vector3(0, offSet + this.getHeight() / 2 + (this.getWidth() - this.padding) / 2 + this.edgesWidth / 120, 0)));
            this.d3ModelPyramid.rotate(new Vector3(0, 1, 0), Math.PI / 4);
            this.d3ModelPyramid.material = mat;
            this.d3ModelPyramid.material.backFaceCulling = false;
            this.d3Model = Mesh.MergeMeshes([this.d3Model, this.d3ModelPyramid], true);
        }

        if (this.config.building.colors.edges) {
            const edgesColor = this.getColor(this.config.building.colors.edges, this.elementModel.types);
            if (edgesColor !== undefined) {
                this.d3Model.enableEdgesRendering();
                this.d3Model.edgesWidth = this.edgesWidth;
                const c = Color3.FromHexString(edgesColor);
                this.d3Model.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // if (this.d3ModelPyramid !== undefined) {
                //     this.d3ModelPyramid.enableEdgesRendering();
                //     this.d3ModelPyramid.edgesWidth = this.edgesWidth;
                //     const c = Color3.FromHexString(edgesColor);
                //     this.d3ModelPyramid.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // }
                // if (this.d3ModelChimney1 !== undefined) {
                //     this.d3ModelChimney1.enableEdgesRendering();
                //     this.d3ModelChimney1.edgesWidth = this.edgesWidth;
                //     const c = Color3.FromHexString(edgesColor);
                //     this.d3ModelChimney1.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // }
                // if (this.d3ModelChimney2 !== undefined) {
                //     this.d3ModelChimney2.enableEdgesRendering();
                //     this.d3ModelChimney2.edgesWidth = this.edgesWidth;
                //     const c = Color3.FromHexString(edgesColor);
                //     this.d3ModelChimney2.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // }
                // if (this.d3ModelChimney3 !== undefined) {
                //     this.d3ModelChimney3.enableEdgesRendering();
                //     this.d3ModelChimney3.edgesWidth = this.edgesWidth;
                //     const c = Color3.FromHexString(edgesColor);
                //     this.d3ModelChimney3.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // }
                // if (this.d3ModelSphere !== undefined) {
                //     this.d3ModelSphere.enableEdgesRendering();
                //     this.d3ModelSphere.edgesWidth = this.edgesWidth;
                //     const c = Color3.FromHexString(edgesColor);
                //     this.d3ModelSphere.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // }
                // if (this.d3ModelInvertedPyramid !== undefined) {
                //     this.d3ModelInvertedPyramid.enableEdgesRendering();
                //     this.d3ModelInvertedPyramid.edgesWidth = this.edgesWidth;
                //     const c = Color3.FromHexString(edgesColor);
                //     this.d3ModelInvertedPyramid.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // }
                // if (this.d3ModelPrism !== undefined) {
                //     this.d3ModelPrism.enableEdgesRendering();
                //     this.d3ModelPrism.edgesWidth = this.edgesWidth;
                //     const c = Color3.FromHexString(edgesColor);
                //     this.d3ModelPrism.edgesColor = new Color4(c.r, c.g, c.b, 1);
                // }
            }

            this.d3Model.actionManager = new ActionManager(this.scene);

            UIController.addEntry(this.getName(), this);

            // const links = this.links;
            this.d3Model.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnPointerOverTrigger
                    },
                    () => {
                        this.highlight(true);
                        this.links.forEach(l => l.display(undefined, true));
                        UIController.displayObjectInfo(this);
                        // document.getElementById("nodes_details").innerText = out;
                    }
                )
            );
            this.d3Model.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnPointerOutTrigger
                    },
                    () => {
                        this.highlight(false);
                        this.links.forEach(l => l.display(undefined, false));
                    }
                )
            );
            this.d3Model.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnPickTrigger
                    },
                    () => {
                        this.flag = !this.flag;
                        this.highlight(this.flag, true);
                        this.links.forEach(l => l.display(this.flag, this.flag));
                        UIController.displayObjectInfo(this, this.flag ? this.flag : undefined);
                    }
                )
            );
        }

        // Display links to other buildings
        // this.links.forEach(l => {
        //     if (l.src.elementModel.name === this.getName()) l.render(this.config);
        // });
    }
}