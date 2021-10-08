import { District } from "../entities/district.interface";
import { ClassImplem } from "./classImplem.model";
import { Building } from "../entities/building.interface";

export class VPVariantsImplem extends District {
    public vp: ClassImplem;

    buildings: ClassImplem[];
    districts: VPVariantsImplem[];

    constructor(vp: ClassImplem = undefined) {
        super();
        this.vp = vp;
        if (vp !== undefined) {
            this.name = vp.name;
        } else {
            this.name = "";
        }
    }

    addBuilding(building: ClassImplem) {
        return this.buildings.push(building);
    }

    addDistrict(district: VPVariantsImplem) {
        return this.districts.push(district);
    }

    getTotalWidth(): number {
        return 0;
    }

    hasChild(obj: ClassImplem | VPVariantsImplem): boolean {
        for (let i = 0; i < this.buildings.length; i++) {
            if (this.buildings[i].name === obj.name) {
                return true;
            }
        }

        for (let i = 0; i < this.districts.length; i++) {
            if (this.buildings[i].name === obj.name) {
                return true;
            } else if (this.districts[i].hasChild(obj)) {
                return true;
            }
        }

        return false;
    }

    filterCompLevel(level: number): VPVariantsImplem | [VPVariantsImplem[], ClassImplem[]] {
        if (this.vp !== undefined && this.vp.compLevel > -1 && this.vp.compLevel <= level) {
            // let result: VPVariantsImplem = Object.assign(new VPVariantsImplem(), this);
            // let vp: ClassImplem = Object.assign({}, this.vp);
            // let result = new VPVariantsImplem(vp);
            let result = new VPVariantsImplem(this.vp);

            result.buildings = Object.assign([], this.buildings.filter(b => (b.compLevel > -1 && b.compLevel <= level) || b.types.includes("API")));

            this.districts.forEach(d => {
                const f = d.filterCompLevel(level);

                if (Array.isArray(f)) {
                    f[0].forEach(e => {
                        result.addDistrict(e);
                    });

                    f[1].forEach(e => {
                        result.addBuilding(e);
                    });
                } else {
                    result.addDistrict(f);
                }
            });
            return result;
        } else { // If this should not appear
            let result: [VPVariantsImplem[], ClassImplem[]] = [[], []];

            result[1] = Object.assign([], this.buildings.filter(b => b.compLevel > -1 && b.compLevel <= level));

            this.districts.forEach(d => {
                const f = d.filterCompLevel(level);

                if (Array.isArray(f)) {
                    f[0].forEach(e => {
                        if (e.vp === undefined || !result[0].map(n => n.vp === undefined ? "" : n.vp.name).includes(e.vp.name))
                            result[0].push(e);
                    });

                    f[1].forEach(e => {
                        if (!result[1].map(n => n.name).includes(e.name))
                            result[1].push(e);
                    });
                } else {
                    if (f.vp === undefined || !result[0].map(n => n.vp === undefined ? "" : n.vp.name).includes(f.vp.name))
                        result[0].push(f);
                }
            });
            return result;
        }
    }

    public getMaxCompLevel() : number {
        return Math.max(this.vp === undefined ? -1 : this.vp.compLevel, super.getMaxCompLevel());
    }

    public getBuildingFromName(name: string) : Building {
        if (this.vp !== undefined && this.vp.name === name) {
            return this.vp;
        }
        return super.getBuildingFromName(name);
    }
}