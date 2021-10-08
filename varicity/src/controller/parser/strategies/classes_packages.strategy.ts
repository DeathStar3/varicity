import { Node } from './../symfinder_elements/nodes/node.element';
import { EntitiesList } from "../../../model/entitiesList";
import { NodeElement } from "../symfinder_elements/nodes/node.element";
import { ClassImplem } from "../../../model/entitiesImplems/classImplem.model";
import { PackageImplem } from "../../../model/entitiesImplems/packageImplem.model";
import { LinkElement } from "../symfinder_elements/links/link.element";
import { LinkImplem } from "../../../model/entitiesImplems/linkImplem.model";
import { JsonInputInterface } from "../../../model/entities/jsonInput.interface";
import { Config } from "../../../model/entitiesImplems/config.model";
import { ParsingStrategy } from "./parsing.strategy.interface";

export class ClassesPackagesStrategy implements ParsingStrategy {
    public parse(data: JsonInputInterface, config: Config): EntitiesList {
        console.log('Analyzing with classes and packages strategy: ', data);

        const nodesList: NodeElement[] = [];
        data.nodes.forEach(n => {
            let node = new NodeElement(n.name);
            node.nbMethodVariants = (n.methodVariants === undefined) ? 0 : n.methodVariants;
            node.nbFunctions = (n.methodVariants === undefined) ? 0 : n.methodVariants;

            const attr = n.attributes;
            let nbAttributes = 0;
            attr.forEach(a => {
                nbAttributes += a.number;
            })
            const cVar = (n.constructorVariants === undefined) ? 0 : n.constructorVariants;
            node.nbAttributes = nbAttributes;
            node.nbConstructorVariants = cVar;

            node.types = n.types;
            nodesList.push(node);
        });

        const packagesList: PackageImplem[] = [];
        const classesList: ClassImplem[] = [];

        nodesList.forEach(n => {
            this.addToLists(n.name.split('.'), n, packagesList, classesList);
        });

        let result = new EntitiesList();
        result.buildings = classesList;

        let root = new PackageImplem("");
        root.districts = packagesList;
        result.district = root;

        const linkElements: LinkElement[] = [];
        data.links.forEach(l => {
            linkElements.push(new LinkElement(l.source, l.target, l.type));
        })

        const inheritancesList: LinkImplem[] = [];
        linkElements.forEach(le => {
            const source = result.getBuildingFromName(le.source);
            const target = result.getBuildingFromName(le.target);
            inheritancesList.push(new LinkImplem(source, target, le.type));
        })
        result.links = inheritancesList;

        console.log(result);

        return result;
    }

    private addToLists(splitName: string[], node: Node, packagesList: PackageImplem[], classesList: ClassImplem[]) {
        if (splitName.length >= 2) { // When there is a class found
            const p = this.getPackageFromName(splitName[0], packagesList);
            if (p !== undefined) { // if the package is found at this level we can add the class into it
                if (splitName.length == 2) { // if the class is terminal then add it to the package
                    p.addBuilding(new ClassImplem(node, 0));
                } else { // else add it to the corresponding subPackage
                    this.addToLists(splitName.slice(1), node, p.districts, classesList);
                }
            } else { // if not then we create the package and add the building to it
                const newP = new PackageImplem(splitName[0]);
                packagesList.push(newP);
                if (splitName.length == 2) { // If the class is terminal then add it to the package
                    newP.addBuilding(new ClassImplem(node, 0));
                } else { // else add it to its packages list
                    this.addToLists(splitName.slice(1), node, newP.districts, classesList);
                }
            }
        } else { // if the depth is 0, then add it to the classesList
            const newC = new ClassImplem(node, 0);
            classesList.push(newC);
        }
    }

    private getPackageFromName(name: string, packagesList: PackageImplem[]): PackageImplem {
        let result: PackageImplem = undefined;
        packagesList.forEach(p => {
            if (p.name === name) {
                result = p;
            }
        });
        return result;
    }
}