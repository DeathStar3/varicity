import { UIController } from './ui.controller';
import { Config } from './../../model/entitiesImplems/config.model';

export class ConfigController {
    public static createConfigFolder(config: Config): void {
        // let node = document.getElementById("console");
        // let configNode = document.createElement("div");
        let configNode = document.getElementById("config");
        // configNode.id = "config";
        configNode.innerHTML = "Config parameters";
        // node.appendChild(configNode);

        this.populateChildren(config, configNode);

        /* @ts-ignore */
        for (let child of configNode.children) {
            child.style.display = "none";
        }
        configNode.onclick = (me) => {
            if (me.target == configNode) {
                /* @ts-ignore */
                for (let child of configNode.children) {
                    if (child.style.display == "block") child.style.display = "none";
                    else child.style.display = "block";
                }
            }
        }
    }

    private static createKey(key: string, parent: HTMLElement): HTMLElement {
        let node = document.createElement("div");
        node.innerHTML = key;
        node.setAttribute("value", key);
        parent.appendChild(node);
        return node;
    }

    private static createInput(value: string, parent: HTMLElement, type?: string): HTMLInputElement {
        let input = document.createElement("input");
        input.value = value;
        if (type !== undefined) {
            input.type = type;
        }
        parent.appendChild(input);
        return input;
    }

    private static createSelect(defaultValue: string, parent: HTMLElement): HTMLSelectElement {
        let input = document.createElement("select");
        let options = ["IN", "OUT", "IN_OUT"];
        options.forEach( function(opt) {
            let optionElement = document.createElement("option");
            optionElement.value = opt;
            optionElement.label = opt;
            if (opt == defaultValue) {
                optionElement.defaultSelected = true;
            }
            input.add(optionElement)
        });
        parent.appendChild(input);
        return input;
    }

    private static findValidParents(node: HTMLElement): string[] {
        let p = node.parentElement
        let arr = [p.getAttribute("value")];
        while (p.parentElement.id != "config") {
            p = p.parentElement;
            arr.push(p.getAttribute("value"));
        }
        return arr.reverse();
    }

    private static stringArrayListener(ke: KeyboardEvent, input: HTMLInputElement, parent: HTMLElement) {
        let prev = input.getAttribute("previous");
        if (ke.key == "Enter") {
            if (!(input.value == prev)) { // prevents entering if the user hasn't changed the input
                let arr = this.findValidParents(input);
                UIController.changeConfig(arr, [prev, input.value]);

                if (input.value == "" && prev != "") { // if current is empty when prev wasn't
                    parent.removeChild(input); // then delete the node

                } else if (input.value != "" && prev == "") { // else if prev is empty and current isn't
                    let i = this.createInput("", parent);   // we create another empty node to be able to add to the config file

                    i.setAttribute("previous", "");
                    i.className = "child";
                    i.setAttribute("list", "datalist");
                    i.style.display = "block";
                    i.addEventListener("keyup", (ke) => this.stringArrayListener(ke, i, parent));
                }

                input.setAttribute("previous", input.value); // previous value becomes the current
            }
        }
    }

    private static populateChildren(config: any, parent: HTMLElement): void {
        if (Array.isArray(config)) {
            for (let obj of config) {
                if (Config.instanceOfColor(obj)) {
                    let node = this.createKey(obj.name, parent);
                    let input = this.createInput(obj.color, node, "color");
                    node.className = "child";

                    input.className = "right-input";
                    input.addEventListener("change", (ke) => {
                        let arr = this.findValidParents(node);
                        UIController.changeConfig(arr, { name: node.getAttribute("value"), color: input.value });
                    });
                } else this.populateChildren(obj, parent); // it's a string
            }
            let attr = parent.getAttribute("value");
            let values = ["api_classes", "blacklist", "underground_road", "air_traffic", "hierarchy_links"];
            if (values.includes(attr) || values.includes(parent.parentElement.getAttribute("value"))) {
                this.populateChildren("", parent);
            }
        }
        else {
            if (!(config instanceof Object)) { // not [] nor object
                let input = this.createInput(config, parent);

                let prev = input.value;
                input.setAttribute("previous", prev);
                input.className = "child";

                let attr = parent.getAttribute("value"); // get parent of the parent
                let values = ["api_classes", "blacklist", "hierarchy_links"];
                if (values.includes(attr) || values.includes(parent.parentElement.getAttribute("value"))) {
                    input.setAttribute("list", "datalist");
                }
                input.addEventListener("keyup", (ke) => this.stringArrayListener(ke, input, parent));
            }
            else {
                for (let key in config) {
                    if (key !== "default_level") {
                        let node = this.createKey(key, parent);

                        if ((config[key]) instanceof Object) {
                            this.populateChildren(config[key], node); // the child will be an array of values
                            node.className = "parent";

                            /* @ts-ignore */
                            for (let child of node.children) {
                                child.style.display = "none";
                            }
                            node.onclick = (me) => {
                                if (me.target == node) {
                                    /* @ts-ignore */
                                    for (let child of node.children) {
                                        if (child.style.display == "block") child.style.display = "none";
                                        else child.style.display = "block";
                                    }
                                }
                            }
                        }
                        else {
                            let input;
                            if (key == "orientation") {
                                input = this.createSelect(config[key], node);
                            } else {
                                input = this.createInput(config[key], node);
                            }
                            node.className = "child";
                            if(parent.getAttribute("value") === "variables") {
                                input.setAttribute("list", "attributelist");
                            }
                            if (key == "orientation") {
                                input.addEventListener("change", () => {
                                    let arr = this.findValidParents(input);
                                    UIController.changeConfig(arr, ["", input.value]);
                                })
                            } else {
                                input.addEventListener("keyup", (ke) => {
                                    if (ke.key == "Enter") {
                                        let arr = this.findValidParents(input);
                                        UIController.changeConfig(arr, ["", input.value]);
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
    }
}