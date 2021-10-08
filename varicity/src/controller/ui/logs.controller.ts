import {EntitiesList} from "../../model/entitiesList";

export class LogsController {

    static logs: Map<string, number> = new Map();

    static createLogsDisplay() {
        this.logs.set("Number of buildings", 0);
        this.logs.set("Number of districts", 0);
    }

    static updateLogs(entitiesList: EntitiesList) {
        this.logs.set("Number of buildings", entitiesList.getNumberOfBuildings() - this.logs.get("Number of buildings"));
        this.logs.set("Number of districts", entitiesList.getNumberOfDistricts() - this.logs.get("Number of districts"));
    }
}