import { Building } from './building.interface';

export abstract class District {
    buildings: Building[];
    districts: District[];

    name: string;
    // width: number; // width will vary depending on number of districts and buildings, so maybe not declare it as attribute?

    abstract addDistrict(district: District);
    abstract addBuilding(building: Building);

    abstract getTotalWidth(field: string): number;

    abstract hasChild(obj: District | Building): boolean;

    abstract filterCompLevel(level: number) : District | [District[],Building[]];

    constructor() {
        this.buildings = [];
        this.districts = [];
    }

    // Get a building from its full name
    public getBuildingFromName(name: string) : Building {
        for (let i = 0; i < this.buildings.length; i++) {
            if (this.buildings[i].name === name) {
                return this.buildings[i];
            }
        }
        for (let i = 0; i < this.districts.length; i++) {
            const res = this.districts[i].getBuildingFromName(name);
            if (res !== undefined) {
                return res;
            }
        }
        return undefined;
    }

    public getMaxCompLevel() : number {
        return Math.max(
            this.buildings.reduce((a, b) => Math.max(a, b.compLevel), -1),
            this.districts.reduce((a, b) => Math.max(a, b.getMaxCompLevel()), -1)
        );
    }

    public depth() : number {
        if (this.districts.length > 0) {
            const depths = this.districts.map(d => d.depth());
            return depths.reduce((a, b) => Math.max(a, b)) + 1;
        } else {
            return 1;
        }
    }

    public getNumberOfBuildings() {
        return this.buildings.length + this.districts.reduce((a, b) => a + b.getMaxCompLevel(), 0);
    }

    public getNumberOfDistricts() {
        return 1 + this.districts.reduce((a, b) => a + b.getNumberOfDistricts(), 0);
    }
}