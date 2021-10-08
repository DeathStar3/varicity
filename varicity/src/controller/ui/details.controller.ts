import { Building3D } from './../../view/common/3Delements/building3D';

export class DetailsController {

    private static force: boolean = false;
    private static current: Building3D;

    static displayObjectInfo(obj: Building3D, force: boolean) {
        if(this.force && !force) return;
        if(this.force && force) {
            this.current.highlight(false, true);
            this.current.showAllLinks(false);
        }
        this.current = obj
        let parent = document.getElementById("nodes_details");

        while (parent.firstChild) {
            parent.removeChild(parent.lastChild);
        }
        parent.innerHTML = "Object details";

        // Display the model
        let elementDetails = document.createElement("div");
        elementDetails.innerHTML = "Model:";
        parent.appendChild(elementDetails);

        this.populateChildren(obj.elementModel, elementDetails);

        // Display the links
        let linksDetails = document.createElement("div");
        linksDetails.innerHTML = "Links:";
        parent.appendChild(linksDetails);

        this.populateLinks(obj, linksDetails);

        this.showChildrenOnClick(elementDetails);
    }

    private static showChildrenOnClick(parent: HTMLElement) {
        /* @ts-ignore */
        for (let child of parent.children) {
            child.style.display = "block";
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

    private static createEntry(textContent: string, parent: HTMLElement): HTMLElement {
        let el = document.createElement("div");
        el.innerHTML = textContent;
        parent.appendChild(el);
        return el;
    }

    private static populateLinks(obj: Building3D, parent: HTMLElement) {
        for (let l of obj.links) {
            let keyElement = document.getElementById(l.type);
            if (keyElement == undefined) { // we check if we have already declared him
                keyElement = document.createElement("div");
                keyElement.id = l.type;
                keyElement.innerHTML = l.type + ':';
                keyElement.className = "parent";
                parent.appendChild(keyElement);
            }
            let listElement = document.createElement("div");
            let target = (l.src.getName() == obj.getName() ? l.dest : l.src);
            listElement.innerHTML = target.getName();
            listElement.className = "child";
            keyElement.appendChild(listElement);

            listElement.addEventListener("mouseenter", () => {
                target.highlight(true);
            });

            listElement.addEventListener("mouseleave", () => {
                target.highlight(false);
            });

            listElement.addEventListener("click", () => {
                target.focus();
            });
        }
    }

    private static populateChildren(obj: any, parent: HTMLElement) {
        if (Array.isArray(obj)) {
            for (let key of obj) {
                if ((obj[key] == undefined)) { // key is a value
                    this.createEntry(key, parent).className = "child";
                } else {
                    throw new Error('Not yet implemented');
                }
            }
        } else {
            for (let key of Object.keys(obj)) {
                if (!(obj[key] instanceof Object)) { // value of key isn't an object
                    let text: string;
                    text = key + ': ' + obj[key];
                    this.createEntry(text, parent).className = "parent";
                } else {
                    let p = this.createEntry(key + ' :', parent);
                    p.className = "parent";
                    this.populateChildren(obj[key], p);

                    this.showChildrenOnClick(p);
                }
            }
        }
    }
}
