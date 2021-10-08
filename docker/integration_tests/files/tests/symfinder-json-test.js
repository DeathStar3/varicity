/*
 * This file is part of symfinder.
 *
 * symfinder is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * symfinder is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with symfinder. If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright 2018-2021 Johann Mortara <johann.mortara@univ-cotedazur.fr>
 * Copyright 2018-2021 Xhevahire Tërnava <t.xheva@gmail.com>
 * Copyright 2018-2021 Philippe Collet <philippe.collet@univ-cotedazur.fr>
 */

describe("Testing JSON output for vps_and_variants", () => {

    var jsonData, jsonStatsData;

    beforeEach(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/vps_and_variants.json", "tests/data/vps_and_variants-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be 6 nodes', () => {
        expect(jsonData.nodes.length).toBe(6);
    });

    describe('OneConstructorOneMethod', () => {

        var node;

        beforeEach(() => {
            node = getNodeWithName(jsonData, "OneConstructorOneMethod");
        });

        it('there should be one method in the methods list', () => {
            expect(node.methods.length).toBe(1);
        });
        it('the method name is method1', () => {
            expect(node.methods[0].name).toBe("method1");
        });
        it('the method appears one time', () => {
            expect(node.methods[0].number).toBe(1);
        });
        it('there should be one constructor in the constructors list', () => {
            expect(node.constructors.length).toBe(1);
        });
        it('the constructor name is OneConstructorOneMethod', () => {
            expect(node.constructors[0].name).toBe("OneConstructorOneMethod");
        });
        it('the constructor appears one time', () => {
            expect(node.constructors[0].number).toBe(1);
        });

    })

    describe('TwoConstructorsOneMethod', () => {

        var node;

        beforeEach(() => {
            node = getNodeWithName(jsonData, "TwoConstructorsOneMethod");
        });

        it('there should be one method in the methods list', () => {
            expect(node.methods.length).toBe(1);
        });
        it('the method name is method1', () => {
            expect(node.methods[0].name).toBe("method1");
        });
        it('the method appears one time', () => {
            expect(node.methods[0].number).toBe(1);
        });
        it('there should be one constructor in the constructors list', () => {
            expect(node.constructors.length).toBe(1);
        });
        it('the constructor name is TwoConstructorsOneMethod', () => {
            expect(node.constructors[0].name).toBe("TwoConstructorsOneMethod");
        });
        it('the constructor appears two times', () => {
            expect(node.constructors[0].number).toBe(2);
        });

    })

    describe('OneConstructorTwoMethods', () => {

        var node;

        beforeEach(() => {
            node = getNodeWithName(jsonData, "OneConstructorTwoMethods");
        });

        it('there should be one method in the methods list', () => {
            expect(node.methods.length).toBe(1);
        });
        it('the method name is method1', () => {
            expect(node.methods[0].name).toBe("method1");
        });
        it('the method appears two times', () => {
            expect(node.methods[0].number).toBe(2);
        });
        it('there should be one constructor in the constructors list', () => {
            expect(node.constructors.length).toBe(1);
        });
        it('the constructor name is OneConstructorTwoMethods', () => {
            expect(node.constructors[0].name).toBe("OneConstructorTwoMethods");
        });
        it('the constructor appears one time', () => {
            expect(node.constructors[0].number).toBe(1);
        });

    })

    describe('TwoConstructorsTwoMethods', () => {

        var node;

        beforeEach(() => {
            node = getNodeWithName(jsonData, "TwoConstructorsTwoMethods");
        });

        it('there should be one method in the methods list', () => {
            expect(node.methods.length).toBe(1);
        });
        it('the method name is method1', () => {
            expect(node.methods[0].name).toBe("method1");
        });
        it('the method appears one time', () => {
            expect(node.methods[0].number).toBe(2);
        });
        it('there should be one constructor in the constructors list', () => {
            expect(node.constructors.length).toBe(1);
        });
        it('the constructor name is TwoConstructorsTwoMethods', () => {
            expect(node.constructors[0].name).toBe("TwoConstructorsTwoMethods");
        });
        it('the constructor appears one time', () => {
            expect(node.constructors[0].number).toBe(2);
        });

    })

    describe('TwoConstructorsNoMethod', () => {

        var node;

        beforeEach(() => {
            node = getNodeWithName(jsonData, "TwoConstructorsNoMethod");
        });

        it('there should be no method in the methods list', () => {
            expect(node.methods.length).toBe(0);
        });
        it('there should be one constructor in the constructors list', () => {
            expect(node.constructors.length).toBe(1);
        });
        it('the constructor name is TwoConstructorsNoMethod', () => {
            expect(node.constructors[0].name).toBe("TwoConstructorsNoMethod");
        });
        it('the constructor appears one time', () => {
            expect(node.constructors[0].number).toBe(2);
        });

    })

    describe('NoConstructorTwoMethods', () => {

        var node;

        beforeEach(() => {
            node = getNodeWithName(jsonData, "NoConstructorTwoMethods");
        });

        it('there should be one method in the methods list', () => {
            expect(node.methods.length).toBe(1);
        });
        it('the method name is method1', () => {
            expect(node.methods[0].name).toBe("method1");
        });
        it('the method appears one time', () => {
            expect(node.methods[0].number).toBe(2);
        });
        it('there should be no constructor in the constructors list', () => {
            expect(node.constructors.length).toBe(0);
        });

    })

});

describe("Testing JSON output for multiple_vp", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/multiple_vp.json", "tests/data/multiple_vp-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be 1 class level VP', () => {
        expect(jsonStatsData.classLevelVPs).toBe(1);
    });
    it('there should be 0 class level variant', () => {
        expect(jsonStatsData.classLevelVariants).toBe(0);
    });
    it('there should be 2 method level VPs', () => {
        expect(jsonStatsData.methodLevelVPs).toBe(2);
    });
    it('there should be 1 method VP', () => {
        expect(jsonStatsData.methodsVPs).toBe(1);
    });
    it('there should be 1 constructor VP', () => {
        expect(jsonStatsData.constructorsVPs).toBe(1);
    });
    it('there should be 2 method variants', () => {
        expect(jsonStatsData.methodsVariants).toBe(2);
    });
    it('there should be 2 constructor variants', () => {
        expect(jsonStatsData.constructorsVariants).toBe(2);
    });

    it('there should be 1 node', () => {
        expect(jsonData.nodes.length).toBe(1);
    });
    it('there should be 1 method in the methods list', () => {
        expect(jsonData.nodes[0].methods.length).toBe(1);
    });
    it('the method name is method1', () => {
        expect(jsonData.nodes[0].methods[0].name).toBe("method1");
    });
    it('the method appears two times', () => {
        expect(jsonData.nodes[0].methods[0].number).toBe(2);
    });
    it('there should be 1 constructor in the constructors list', () => {
        expect(jsonData.nodes[0].constructors.length).toBe(1);
    });
    it('the constructor name is MultipleVPClass', () => {
        expect(jsonData.nodes[0].constructors[0].name).toBe("MultipleVPClass");
    });
    it('the constructor appears two times', () => {
        expect(jsonData.nodes[0].constructors[0].number).toBe(2);
    });
});

describe("Testing JSON output for generics", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/generics.json", "tests/data/generics-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be a node called MyPair', () => {
        expect(jsonData.nodes.filter(n => n.name === "MyPair").length).toBe(1);
    });
    it('MyPair should be a strategy', () => {
        expect(getNodeWithName(jsonData, "MyPair").types.includes("STRATEGY")).toBeTruthy();
    });

});

describe("Importing a class from another package", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/import_from_different_package.json", "tests/data/import_from_different_package-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be a node called AbstractAlgo', () => {
        expect(jsonData.nodes.filter(n => n.name === "abs.AbstractAlgo").length).toBe(1);
    });
    it('there should be 1 class level variant', () => {
        expect(jsonStatsData.classLevelVariants).toBe(1);
    });

});

describe("Importing a whole package", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/import_from_different_package_all_package_imported.json", "tests/data/import_from_different_package_all_package_imported-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be a node called AbstractAlgo', () => {
        expect(jsonData.nodes.filter(n => n.name === "abs.AbstractAlgo").length).toBe(1);
    });
    it('there should be 1 class level variant', () => {
        expect(jsonStatsData.classLevelVariants).toBe(1);
    });

});

describe("Inner class", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/inner_class.json", "tests/data/inner_class-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be no variant', () => {
        expect(jsonStatsData.classLevelVariants).toBe(0);
    });

});

describe("Inner class defined before fields", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/inner_class_before_fields.json", "tests/data/inner_class_before_fields-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be no variant', () => {
        expect(jsonStatsData.classLevelVariants).toBe(0);
    });

});

describe("Density", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/density.json", "tests/data/density-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be 6 nodes in the allnodes list', () => {
        expect(jsonData.allnodes.length).toBe(6);
    });
    it('there should be 2 VPs', () => {
        expect(jsonData.allnodes.filter(n => n.types.includes("VP")).length).toBe(2);
    });
    it('there should be 2 composition links', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE").length).toBe(2);
    });
    it('there are 4 DENSE nodes', () => {
        expect(jsonData.allnodes.filter(n => n.types.includes("DENSE")).length).toBe(4);
    });
    it('the Renderer subclasses should be DENSE', () => {
        expect(getNodeWithName(jsonData, "RectangleRenderer").types).toContain("DENSE");
        expect(getNodeWithName(jsonData, "CircleRenderer").types).toContain("DENSE");
    });
    it('the Shape subclasses should be DENSE', () => {
        expect(getNodeWithName(jsonData, "Rectangle").types).toContain("DENSE");
        expect(getNodeWithName(jsonData, "Circle").types).toContain("DENSE");
    });

});

function getJsonData(file, statsFile) {
    return new Promise(((resolve, reject) => {
        d3.queue()
            .defer(d3.json, file)
            .defer(d3.json, statsFile)
            .await(function (err, data, statsData) {
                resolve([data, statsData]);
            });
    }));
}

function getNodeWithName(jsonData, name) {
    return jsonData.nodes.filter(n => n.name === name)[0];
}