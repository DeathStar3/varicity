import { Config } from './../../../model/entitiesImplems/config.model';
import { Element3D } from '../../common/3Dinterfaces/element3D.interface';
import { Building3D } from '../../common/3Delements/building3D';
import { District } from '../../../model/entities/district.interface';
import { ActionManager, Color3, ExecuteCodeAction, StandardMaterial } from '@babylonjs/core';
import { Scene } from '@babylonjs/core';
import { MeshBuilder, Vector3 } from '@babylonjs/core';

export class District3D extends Element3D {
    elementModel: District;
    depth: number;

    vector: Vector3;

    size = 0;

    padding: number = 5;

    d3Buildings: Building3D[] = [];
    d3Districts: District3D[] = [];

    status = false;

    constructor(scene: Scene, element: District, depth: number) {
        super(scene);
        this.depth = depth;
        this.elementModel = element;
        // this.x = x;
        // this.z = z;
    }

    showAllLinks(status?: boolean) {
        if (status) this.status = status;
        else this.status = !this.status;
        this.d3Buildings.forEach(b =>
            b.showAllLinks(this.status)
        );
        this.d3Districts.forEach(d =>
            d.showAllLinks(this.status)
        );
    }

    resize(placements: number[][], width: number): number[][] {
        let currentRow = 0;
        let currentLength = 0;
        let result = [[]];
        for (let i = 0; i < placements.length; i++) {
            for (let j = 0; j < placements[i].length; j++) {
                if (currentLength + placements[i][j] > width) {
                    currentRow++;
                    currentLength = 0;
                    result.push([]);
                }
                result[currentRow].push(placements[i][j]);
                currentLength += placements[i][j];
            }
        }
        return result;
    }

    calculateSize(sizesArray: number[]): number {
        let placements = [[]];
        placements[0][0] = sizesArray[0];
        let currentWidth = sizesArray[0];
        let currentRow = 0;
        for (let i = 1; i < sizesArray.length; i++) {
            if (sizesArray[i] + placements[currentRow].reduce((prev, curr) => prev += curr, 0) > currentWidth) {
                if (i == 1) {// si c'est le 2ème élément qu'on ajoute
                    placements.push([]);
                    currentWidth += sizesArray[1];
                    placements[0][1] = sizesArray[1];
                    currentRow = 1;
                }
                else { // sinon
                    if (sizesArray[i] + placements.reduce<number>((prev, cur) => prev += cur[0], 0) > currentWidth) { // si on dépasse la height aussi alors il faut resize
                        currentWidth += placements[0][1];
                        placements = this.resize(placements, currentWidth);
                        currentRow = placements.length - 1;
                    } else { // sinon on ajoute à la ligne suivante
                        currentRow++;
                    }
                    if (!placements[currentRow]) {
                        placements.push([]);
                    }
                    placements[currentRow].push(sizesArray[i]);
                }
            } else {
                placements[currentRow].push(sizesArray[i]);
            }
        }
        return currentWidth + placements.length * this.padding / 2;
    }

    getWidth(): number {
        let modelsWithsSizes: number[] = [];
        this.d3Districts.forEach(d => modelsWithsSizes.push(d.getWidth()))
        this.d3Buildings.forEach(b => modelsWithsSizes.push(b.getWidth()))
        // return (this.calculateSize(modelsWithsSizes.sort((a, b) => b - a))); // algo qui calcule size du district en fonction des éléments alain térieur
        return (this.calculateSize(modelsWithsSizes.sort((a, b) => b - a)) + this.padding); // algo qui calcule size du district en fonction des éléments alain térieur
    }

    getLength(): number {
        return this.getWidth();
    }

    get(name: string): Building3D {
        let building: Building3D = undefined;
        if (name.includes(this.elementModel.name)) {
            for (let b of this.d3Buildings) {
                if (b.getName() == name) {
                    return building = b;
                }
            }
            for (let d of this.d3Districts) {
                let b = d.get(name);
                if (b != undefined) {
                    return building = b;
                }
            }
        } else {
            return building;
        }
        return building;
    }

    build(config: Config) {
        this.elementModel.districts.forEach(d => {
            let d3District = new District3D(this.scene, d, this.depth + 1)
            this.d3Districts.push(d3District);
            d3District.build(config);
        });

        this.elementModel.buildings.forEach(b => {
            if (config.blacklist) {
                if (!config.blacklist.includes(b.name)) {
                    let d3Building = new Building3D(this.scene, b, this.depth, config);
                    this.d3Buildings.push(d3Building);
                    d3Building.build();
                }
            }
            else {
                let d3Building = new Building3D(this.scene, b, this.depth, config);
                this.d3Buildings.push(d3Building);
                d3Building.build();
            }
        });
    }

    place(x: number, z: number): void {
        let d3elements: Element3D[] = []
        d3elements = d3elements.concat(this.d3Districts, this.d3Buildings);
        d3elements = d3elements.sort((a, b) => b.getWidth() - a.getWidth());
        let currentX: number = 0;
        let currentZ: number = 0;
        let nextZ = 0;
        this.size = this.getWidth();
        this.vector = new Vector3(x, 30 * this.depth - 15, z);
        // this.vector = new Vector3(x + this.size / 2 + this.padding / 2, 30 * this.depth - 15, z + this.size / 2 + this.padding / 2);

        const s = this.size;
        const p = this.padding;
        d3elements.forEach(e => {
            let eSize = e.getWidth();
            if (currentX + eSize + p > s) {
                currentX = 0;
                currentZ = nextZ;
            }
            if (currentX === 0) {
                // nextZ += eSize;
                nextZ += eSize + p / 2;
            }
            // e.place(x + currentX, z + currentZ);
            // currentX += eSize;
            e.place(x + currentX + (p + eSize - s) / 2, z + currentZ + (p + eSize - s) / 2);
            currentX += eSize + p / 2;
        });
    }

    render(config: Config) {
        this.d3Model = MeshBuilder.CreateBox(
            "package",
            {
                height: 30,
                width: this.size - this.padding,
                depth: this.size - this.padding
            },
            this.scene);
        this.d3Model.setPositionWithLocalVector(this.vector);//new Vector3(this.x + (this.elementModel.getTotalWidth() / 2), 30 * this.depth - 15, this.z));

        let mat = new StandardMaterial("District", this.scene);
        // if config -> district -> colors -> faces is defined
        if (config.district.colors.faces) {
            const districtColor = this.getColor(config.district.colors.faces, ["PACKAGE"]);
            if (districtColor !== undefined) {
                mat.ambientColor = Color3.FromHexString(districtColor);
                mat.diffuseColor = Color3.FromHexString(districtColor);
                mat.emissiveColor = Color3.FromHexString(districtColor);
                mat.specularColor = Color3.FromHexString("#000000");
            }

        }
        this.d3Model.material = mat;

        this.d3Districts.forEach(d => {
            d.render(config);
        });

        this.d3Buildings.forEach(b => {
            b.render();
        });

        this.d3Model.actionManager = new ActionManager(this.scene);
        this.d3Model.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnLeftPickTrigger
                },
                () => this.showAllLinks()
            )
        );
    }
}