import {EntitiesList} from "../../../model/entitiesList";
import {NodeElement} from "../symfinder_elements/nodes/node.element";
import {ClassImplem} from "../../../model/entitiesImplems/classImplem.model";
import {LinkElement} from "../symfinder_elements/links/link.element";
import {LinkImplem} from "../../../model/entitiesImplems/linkImplem.model";
import {VPVariantsImplem} from "../../../model/entitiesImplems/vpVariantsImplem.model";
import {JsonInputInterface, LinkInterface} from "../../../model/entities/jsonInput.interface";
import {Config} from "../../../model/entitiesImplems/config.model";
import {ParsingStrategy} from "./parsing.strategy.interface";
import {Orientation} from "../../../model/entitiesImplems/orientation.enum";

export class VPVariantsStrategy implements ParsingStrategy {
    public parse(data: JsonInputInterface, config: Config, project: string) : EntitiesList {
        // console.log('Analyzing with VP and variants strategy: ', data);

        let nodesList: NodeElement[] = [];
        const apiList: NodeElement[] = [];
        data.nodes.forEach(n => {
            let node = new NodeElement(n.name);
            node.nbMethodVariants = (n.methodVariants === undefined) ? 0 : n.methodVariants;

            const attr = n.attributes;
            let nbAttributes = 0;
            attr.forEach(a => {
                nbAttributes += a.number;
            })
            const cVar = (n.constructorVariants === undefined) ? 0 : n.constructorVariants;
            node.nbAttributes = nbAttributes;
            node.nbConstructorVariants = cVar;

            node.types = Object.assign([], n.types);

            if (config.api_classes[project] !== undefined) {
                if (config.api_classes[project].includes(node.name)) {
                    console.log("API class: " + n.name);
                    node.types.push("API");
                    apiList.push(node);
                }
            }
            nodesList.push(node);
        });

        const linkElements = data.links.map(l => new LinkElement(l.source, l.target, l.type));
        const allLinks = data.alllinks.map(l => new LinkElement(l.source, l.target, l.type));
        const hierarchyLinks = allLinks.filter(l => config.hierarchy_links.includes(l.type));

        nodesList.forEach(n => {
            n.nbVariants = this.getLinkedNodesFromSource(n, nodesList, linkElements).length;
        });

        this.buildComposition(hierarchyLinks, nodesList, apiList, 0, config.orientation);
        //console.log(nodesList.sort((a, b) => a.compositionLevel - b.compositionLevel));
        console.log(nodesList.sort((a, b) => a.name.localeCompare(b.name)));

        const d = this.buildDistricts(nodesList, hierarchyLinks, config.orientation);

        let result = new EntitiesList();
        result.district = d;

        if (config.api_classes[project] !== undefined){
            data.allnodes.filter(
                nod => config.api_classes[project].includes(nod.name)
                    && !nodesList.map(no => no.name).includes(nod.name)
            ).forEach(n => {
                let node = new NodeElement(n.name);
                node.nbMethodVariants = (n.methodVariants === undefined) ? 0 : n.methodVariants;

                const attr = n.attributes;
                let nbAttributes = 0;
                attr.forEach(a => {
                    nbAttributes += a.number;
                })
                const cVar = (n.constructorVariants === undefined) ? 0 : n.constructorVariants;
                node.nbAttributes = nbAttributes;
                node.nbConstructorVariants = cVar;

                node.types = n.types;
                node.types.push("API");
                let c = new ClassImplem(
                    node,
                    node.compositionLevel
                );

                result.district.addBuilding(c);
            });
        }

        allLinks.forEach(le => {
            const source = result.getBuildingFromName(le.source);
            const target = result.getBuildingFromName(le.target);
            if (source !== undefined && target !== undefined){
                result.links.push(new LinkImplem(source, target, le.type));
            }
        });

        // log for non-vp non-variant ndoes
        //console.log(data.allnodes.filter(nod => !nodesList.map(no => no.name).includes(nod.name)).map(n => n.name));

        console.log("Result of parsing: ", result);

        return result;
    }

    private buildComposition(alllinks: LinkInterface[], nodes: NodeElement[], srcNodes: NodeElement[], level: number, orientation: Orientation) : void {
        const newSrcNodes : NodeElement[] = [];
        const nodeNames = srcNodes.map(sn => sn.name);
        nodes.forEach(n => {
            if (nodeNames.includes(n.name)) {
                n.compositionLevel = level;
                alllinks.filter(l => {
                    return (l.target === n.name && !nodeNames.includes(l.source)) // IN
                        || (l.source === n.name && !nodeNames.includes(l.target)) // OUT
                }).forEach(l => {
                    //console.log("Node: ", n.name, " - level: ", n.compositionLevel, " - link: ", l);
                    if ((orientation === Orientation.OUT || orientation === Orientation.IN_OUT) && n.name === l.source && n.name !== l.target) { // OUT
                        const targetNode = this.findNodeByName(l.target, nodes);
                        if (targetNode !== undefined && targetNode.compositionLevel === -1 && !newSrcNodes.map(e => e.name).includes(l.target)) {
                            targetNode.origin = n.name + " (source)";
                            newSrcNodes.push(targetNode);
                        }
                    } else if ((orientation === Orientation.IN || orientation === Orientation.IN_OUT) && n.name === l.target && n.name !== l.source) { // IN
                        const sourceNode = this.findNodeByName(l.source, nodes);
                        if (sourceNode !== undefined && sourceNode.compositionLevel === -1 && !newSrcNodes.map(e => e.name).includes(l.source)) {
                            sourceNode.origin = n.name + " (target)";
                            newSrcNodes.push(sourceNode);
                        }
                    }
                });
            }
        });
        if (newSrcNodes.length > 0) {
            this.buildComposition(alllinks, nodes, newSrcNodes, level+1, orientation);
        }
    }

    private buildDistricts(nodes: NodeElement[], links: LinkElement[], orientation: Orientation) : VPVariantsImplem {
        const roots = nodes.filter(n => n.compositionLevel === 0);
        const rootElems = roots.map(r => {
            return this.buildDistrict(r, nodes, links, 0, orientation);
        });
        let res = new VPVariantsImplem();
        rootElems.forEach(e => {
            if (e instanceof VPVariantsImplem) {
                res.districts.push(e);
            } else {
                res.buildings.push(e);
            }
        });
        return res;
    }

    private buildDistrict(nodeElement: NodeElement, nodes: NodeElement[], links: LinkElement[], level: number, orientation: Orientation) : VPVariantsImplem | ClassImplem {
        const outLinks = this.getLinkedNodesFromSource(nodeElement, nodes, links); // OUT
        const inLinks = this.getLinkedNodesToTarget(nodeElement, nodes, links); // IN
        const linked : NodeElement[] = [];
        if (orientation === Orientation.OUT || orientation === Orientation.IN_OUT) {
            linked.push(...outLinks);
        }
        if (orientation === Orientation.IN || orientation === Orientation.IN_OUT) {
            linked.push(...inLinks);
        }

        const children = linked.filter(ln => ln.compositionLevel === level+1);
        if (children.length > 0) {
            let result = new VPVariantsImplem(new ClassImplem(
                nodeElement,
                nodeElement.compositionLevel
            ));
            children.forEach(c => {
                const r = this.buildDistrict(c, nodes, links, level+1, orientation);
                if (r instanceof VPVariantsImplem) {
                    result.districts.push(r);
                } else {
                    result.buildings.push(r);
                }
            });
            return result;
        } else {
            return new ClassImplem(
                nodeElement,
                nodeElement.compositionLevel
            );
        }
    }

    // private removeFromList(d: VPVariantsImplem, l: VPVariantsImplem[]) : VPVariantsImplem[] {
    //     let index = -1;
    //     for (let i = 0; i < l.length; i++) {
    //         if (l[i].name === d.name) {
    //             index = i;
    //             break;
    //         }
    //     }
    //     if (index > -1) {
    //         return l.splice(index, 1);
    //     } else {
    //         throw "error: remove from list did not found node";
    //     }
    // }

    private getLinkedNodesFromSource(n: NodeElement, nodes: NodeElement[], links: LinkElement[]) : NodeElement[]{
        const name = n.name;
        const res: NodeElement[] = [];

        links.forEach(l => {
            if (l.source === name && l.target !== name) {
                const n = this.findNodeByName(l.target, nodes);
                if (n !== undefined)
                    res.push(n);
            }
        });

        return res;
    }

    private getLinkedNodesToTarget(n: NodeElement, nodes: NodeElement[], links: LinkElement[]) : NodeElement[]{
        const name = n.name;
        const res: NodeElement[] = [];

        links.forEach(l => {
            if (l.source !== name && l.target === name) {
                const n = this.findNodeByName(l.source, nodes);
                if (n !== undefined)
                    res.push(n);
            }
        });

        return res;
    }

    private findNodeByName(name: string, nodes: NodeElement[]) : NodeElement {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].name === name) {
                return nodes[i];
            }
        }
        return undefined;
    }
}