import { District } from '../entities/district.interface';
import { ClassImplem } from './classImplem.model';

export class PackageImplem extends District {
    name: string;

    buildings: ClassImplem[];
    districts: PackageImplem[];

    constructor(name: string) {
        super();
        this.name = name;
    }

    addDistrict(district: PackageImplem) {
        // depending on district.name => com.polytech.unice.*
        // find the corresponding district com.polytech
        // add district unice to the corresponding district com.polytech
        return this.districts.push(district);
    }

    addBuilding(building: ClassImplem) {
        // depending on building.name => com.polytech.unice.Object
        // find the corresponding district com.polytech.unice
        // add building Object to the corresponding district com.polytech.unice
        return this.buildings.push(building);
    }

    // returns if obj is a child of this
    hasChild(obj: PackageImplem | ClassImplem): boolean {

        const objNameSplitted = obj.name.split('.');
        const thisNameSplitted = this.name.split('.');

        // Possible to optimize ?
        // objNameSplitted should always be > thisNameSplitted, since it will be recursive
        // therefore, it should be possible to only compare thisNameSplitted[thisNameSplitted.length] with districtNameSplitted[thisNameSplitted.length]
        // since previous districts should have compared the others before
        for(let i = 0; i < thisNameSplitted.length; i++) {
            if(thisNameSplitted[i] != objNameSplitted[i]) {
                return false;
            }
        }
        return true;
    }

    getTotalWidth(field: string): number {
        let width = 0;
        this.districts.forEach(d => {
            width += d.getTotalWidth(field) + 5; // 25 = with padding
        });
        this.buildings.forEach(b => {
            width += b.getWidth(field) + 2; // 10 = with padding
        })
        return width;
    }

    filterCompLevel(level: number): District {
        return this;
    }
}