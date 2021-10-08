import {EntitiesList} from "../../../model/entitiesList";
import {NodeElement} from "../symfinder_elements/nodes/node.element";
import {ClassImplem} from "../../../model/entitiesImplems/classImplem.model";
import {LinkElement} from "../symfinder_elements/links/link.element";
import {LinkImplem} from "../../../model/entitiesImplems/linkImplem.model";
import {VPVariantsImplem} from "../../../model/entitiesImplems/vpVariantsImplem.model";
import {JsonInputInterface, LinkInterface} from "../../../model/entities/jsonInput.interface";
import {ParsingStrategy} from "./parsing.strategy.interface";
import {Config} from "../../../model/entitiesImplems/config.model";

// DEPRECATED
export class VPVariantsInheritanceStrategy implements ParsingStrategy {
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

        const compositionLinks = data.alllinks.map(l => new LinkElement(l.source, l.target, l.type));

        nodesList.forEach(n => {
            n.nbVariants = this.getLinkedNodesFromSource(n, nodesList, linkElements).length;
        });

        this.buildComposition(data.alllinks, nodesList, apiList, 0);
        //console.log(nodesList.sort((a, b) => a.compositionLevel - b.compositionLevel));
        console.log(nodesList.sort((a, b) => a.name.localeCompare(b.name)));

        const d = this.buildDistricts(nodesList, linkElements);

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

        compositionLinks.forEach(le => {
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

    private buildComposition(alllinks: LinkInterface[], nodes: NodeElement[], srcNodes: NodeElement[], level: number) : void {
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
                    if (n.name === l.source && n.name !== l.target) { // OUT
                        const targetNode = this.findNodeByName(l.target, nodes);
                        if (targetNode !== undefined && targetNode.compositionLevel === -1 && !newSrcNodes.map(e => e.name).includes(l.target)) {
                            targetNode.origin = n.name + " (source)";
                            newSrcNodes.push(targetNode);
                        }
                    } else if (n.name === l.target && n.name !== l.source) { // IN
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
            this.buildComposition(alllinks, nodes, newSrcNodes, level+1);
        }
    }

    private buildDistricts(nodes: NodeElement[], links: LinkElement[]) : VPVariantsImplem {
        const trace : VPVariantsImplem[] = [];
        const roots : VPVariantsImplem[] = [];
        nodes.forEach(n => {
            this.buildDistrict(n, trace, nodes, links, roots);
        });
        const res : VPVariantsImplem = new VPVariantsImplem();
        roots.forEach(r => {
            res.addDistrict(r);
        })
        return res;
    }

    private buildDistrict(nodeElement: NodeElement, trace: VPVariantsImplem[], nodes: NodeElement[], links: LinkElement[], roots: VPVariantsImplem[]) : VPVariantsImplem {
        if (nodeElement.types.includes("VP")) { // if n is a vp
            if (!nodeElement.analyzed) { // if n has not been analyzed yet
                // create a new district with n
                let c = new ClassImplem(
                    nodeElement,
                    nodeElement.compositionLevel
                );
                const res = new VPVariantsImplem(c);

                // construct districts for each of linked nodes
                // add each district to the district's districts
                // and add remaining classes to the district's buildings
                const linkedNodes = this.getLinkedNodesFromSource(nodeElement, nodes, links);

                linkedNodes.forEach(n => {
                    const d = this.buildDistrict(n, trace, nodes, links, roots);
                    if (d === undefined) {
                        let c = new ClassImplem(
                            n,
                            n.compositionLevel
                        );
                        res.addBuilding(c);
                    } else {
                        res.addDistrict(d);
                    }
                });

                const ln = this.getLinkedNodesToTarget(nodeElement, nodes, links);
                if (ln.length === 0) {
                    roots.push(res);
                }

                // add result to the trace, set the node to have been analyzed, and return constructed district
                trace.push(res);
                nodeElement.analyzed = true;
                return res;
            } else { // else return its element found from the trace
                for (let i = 0; i < trace.length; i++) {
                    if (trace[i].vp.name === nodeElement.name) {
                        return trace[i];
                    }
                }
                throw "Error: node analyzed but not found in trace.";
            }
        } else { // else return undefined
            return undefined;
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
                res.push(this.findNodeByName(l.target, nodes));
            }
        });

        return res;
    }

    private getLinkedNodesToTarget(n: NodeElement, nodes: NodeElement[], links: LinkElement[]) : NodeElement[]{
        const name = n.name;
        const res: NodeElement[] = [];

        links.forEach(l => {
            if (l.source !== name && l.target === name) {
                res.push(this.findNodeByName(l.source, nodes));
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