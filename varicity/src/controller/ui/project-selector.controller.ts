import { MetricityImplem } from './../../view/metricity/metricityImplem';
import { ParsingStrategy } from './../parser/strategies/parsing.strategy.interface';
import { EvostreetImplem } from "../../view/evostreet/evostreetImplem";
import { ClassesPackagesStrategy } from "../parser/strategies/classes_packages.strategy";
import { UIController } from "./ui.controller";
import { EntitiesList } from "../../model/entitiesList";
import { FilesLoader } from "../parser/filesLoader";
import { VPVariantsStrategy } from "../parser/strategies/vp_variants.strategy";

export class ProjectController {

    static el: EntitiesList;
    private static previousParser: ParsingStrategy;
    private static filename: string;

    static createProjectSelector(keys: string[]) {
        let parent = document.getElementById("project_selector");
        parent.innerHTML = "Project selection";

        let inputElement = document.getElementById("comp-level") as HTMLInputElement;
        inputElement.value = UIController.config.default_level.toString();

        let filterButton = document.getElementById("filter-button") as HTMLButtonElement;
        filterButton.onclick = () => {
            ProjectController.reParse();
        }

        for (let key of keys) {
            let node = document.createElement("div");
            node.innerHTML = key;
            parent.appendChild(node);

            // projets en vision evostreet
            node.addEventListener("click", () => {
                this.previousParser = new VPVariantsStrategy();
                this.filename = key;

                this.reParse();

                parent.childNodes[0].nodeValue = "Project selection: " + key;

                /* @ts-ignore */
                for (let child of parent.children) {
                    child.style.display = "none";
                }
            });

        }
        /* @ts-ignore */
        for (let child of parent.children) {
            child.style.display = "none";
        }
        parent.onclick = (me) => {
            if (me.target == parent) {
                /* @ts-ignore */
                for (let child of parent.children) {
                    if (child.style.display == "block") child.style.display = "none";
                    else child.style.display = "block";
                }
            }
        }
    }

    public static reParse() {
        if (UIController.scene) UIController.scene.dispose();
        UIController.clearMap();
        this.el = this.previousParser.parse(FilesLoader.loadDataFile(this.filename), UIController.config, this.filename);
        let inputElement = document.getElementById("comp-level") as HTMLInputElement;
        inputElement.min = "1";
        const maxLvl = this.el.getMaxCompLevel();
        inputElement.max = maxLvl.toString();
        if (+inputElement.value > maxLvl)
            inputElement.value = maxLvl.toString();
        UIController.scene = new EvostreetImplem(UIController.config, this.el.filterCompLevel(+inputElement.value));
        UIController.scene.buildScene();
    }
}