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

describe("Acceptance tests for all projects", () => {

    projects = __karma__.config.projects.split(",");

    projects.forEach(project => {

        describe("Acceptance tests for " + project, () => {

            describe("Checking JSON content", () => {

                var jsonData, jsonStatsData;

                beforeAll(async (done) => {
                    const [graph, stats] = await getJsonData("tests/data/" + project + ".json", "tests/data/" + project + "-stats.json");
                    jsonData = graph;
                    jsonStatsData = stats;
                    done();
                });

                it('All nodes in the JSON file have different names', () => {
                    var set = [...new Set(jsonData.nodes)];
                    expect(set.length).toBe(jsonData.nodes.length);
                });

                it('All nodes in the JSON file are VPs or variants', () => {
                    expect(jsonData.nodes.every(n => ["VP", "METHOD_LEVEL_VP", "VARIANT"].some(label => n.types.includes(label)))).toBeTruthy();
                });

                it('There is no inner class in the visualization', () => {
                    expect(jsonData.nodes.every(n => !n.types.includes("INNER"))).toBeTruthy();
                });

                it('There is no out of scope class in the visualization', () => {
                    expect(jsonData.nodes.every(n => !n.types.includes("OUT_OF_SCOPE"))).toBeTruthy();
                });

                it('No interface possesses the CLASS tag', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("INTERFACE"))
                        .every(n => !n.types.includes("CLASS")))
                        .toBeTruthy();
                });

                it('The value of the constructorVPs attribute should be 0 or 1 for all nodes not being an interface', () => {
                    expect(jsonData.nodes
                        .filter(n => !n.types.includes("INTERFACE"))
                        .map(n => n.constructorVPs)
                        .every(c => [0, 1].includes(c)))
                        .toBeTruthy();
                });

                it('All nodes in links should be in the list of nodes', () => {
                    var nodesNames = jsonData.nodes.map(n => n.name);
                    var linksSources = jsonData.links.map(l => l.source);
                    var linksTargets = jsonData.links.map(l => l.target);
                    expect(linksSources.every(s => nodesNames.includes(s))).toBeTruthy();
                    expect(linksTargets.every(t => nodesNames.includes(t))).toBeTruthy();
                });

                it('The number of method VPs corresponds to the number of methods appearing at least two times', () => {
                    expect(jsonData.nodes.every(n => {
                        if (typeof n.methodVPs !== 'undefined') {
                            var nbVPs = n.methodVPs;
                            var nbMethodsWithAtLeastTwoAppearances = n.methods.filter(m => m.number >= 2).length;
                            return nbVPs === nbMethodsWithAtLeastTwoAppearances;
                        }
                        return true;
                    })).toBeTruthy();
                });

                it('The number of constructor VPs corresponds to 1 if there is more than one constructor', () => {
                    expect(jsonData.nodes.every(n => {
                        if ((typeof n.constructorVPs !== 'undefined') && (typeof n.constructors !== 'undefined')) {
                            if (n.constructors.length === 0 || n.constructors[0].number === 1) {
                                return n.constructorVPs === 0;
                            } else {
                                return n.constructorVPs === 1;
                            }
                        }
                        return true;
                    })).toBeTruthy();
                });

                it('The constructors have the same name.', () => {
                    expect(jsonData.nodes.every(n => n.constructors.length <= 1)).toBeTruthy();
                });

                it('The number of method variants corresponds to the number of appearances of methods that appear more than once', () => {
                    expect(jsonData.nodes.every(n => {
                        if (typeof n.methodVariants !== 'undefined') {
                            var nbVariants = n.methodVariants;
                            var nbMethodsWithAtLeastTwoAppearances = n.methods.filter(m => m.number >= 2).map(m => m.number).reduce((a, b) => a + b, 0);
                            return nbVariants === nbMethodsWithAtLeastTwoAppearances;
                        }
                        return true;
                    })).toBeTruthy();
                });

                it('The number of constructor variants corresponds to the number of constructors', () => {
                    expect(jsonData.nodes.every(n => {
                        if ((typeof n.constructorVariants !== 'undefined') && (typeof n.constructors !== 'undefined')) {
                            var nbVariants = n.constructorVariants;
                            if (nbVariants === 0 || nbVariants === 1) {
                                return n.constructors.length === 0 || n.constructors[0].number === 1;
                            } else {
                                return nbVariants === n.constructors[0].number
                            }
                        }
                        return true;
                    })).toBeTruthy();
                });

                it('The number of constructors in the constructors list is at most one', () => {
                    expect(jsonData.nodes.every(n => n.constructors.length < 2)).toBeTruthy();
                });

                it('Every strategy detected with the standard method is also detected by composition', () => {
                    expect(jsonData.nodes.filter(n => n.types.includes("STRATEGY") && !n.types.includes("COMPOSITION_STRATEGY")).length).toBe(0);
                });

            });

            describe("Checking visualization without variants", () => {

                var jsonData, jsonStatsData;

                beforeAll(async (done) => {
                    await display("tests/data/" + project + ".json", "tests/data/" + project + "-stats.json", []);
                    const [graph, stats] = await getJsonData("tests/data/" + project + ".json", "tests/data/" + project + "-stats.json");
                    jsonData = graph;
                    jsonStatsData = stats;
                    done();
                });

                it('All abstract classes have a dotted outline', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("ABSTRACT"))
                        .map(n => d3.select('circle[name = "' + n.name + '"]'))
                        .every(c => c.style("stroke-dasharray") === "3, 3"))
                        .toBeTruthy();
                });

                it('All strategy classes have an S', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("STRATEGY"))
                        .map(n => d3.select('text[name = "' + n.name + '"]'))
                        .every(t => t.html().includes("S")))
                        .toBeTruthy();
                });

                it('All factory classes have an F', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("FACTORY"))
                        .map(n => d3.select('text[name = "' + n.name + '"]'))
                        .every(t => t.html().includes("F")))
                        .toBeTruthy();
                });

                it('All template classes have an T', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("TEMPLATE"))
                        .map(n => d3.select('text[name = "' + n.name + '"]'))
                        .every(t => t.html().includes("T")))
                        .toBeTruthy();
                });

                it('All decorator classes have a D', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("DECORATOR"))
                        .map(n => d3.select('text[name = "' + n.name + '"]'))
                        .every(t => t.html().includes("D")))
                        .toBeTruthy();
                });

                it('All interfaces have a black node', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("INTERFACE"))
                        .map(n => d3.select('circle[name = "' + n.name + '"]'))
                        .every(c => c.attr("fill") === "rgb(0, 0, 0)"))
                        .toBeTruthy();
                });

                it('Every class or method level VP node is visible', () => {
                    expect(jsonData.nodes
                        .filter(n => ["VP", "METHOD_LEVEL_VP"].some(label => n.types.includes(label)))
                        .map(n => d3.select('circle[name = "' + n.name + '"]'))
                        .every(c => c.attr("r") >= 10))
                        .toBeTruthy();
                });

                it('No variant is on the visualization if it is not a VP too', () => {
                    expect(jsonData.nodes
                        .filter(n => n.types.includes("VARIANT") && !["VP", "METHOD_LEVEL_VP"].some(label => n.types.includes(label)))
                        .map(n => d3.select('circle[name = "' + n.name + '"]'))
                        .every(c => c.empty() === true))
                        .toBeTruthy();
                });

                afterAll(() => sessionStorage.clear())

            });

            describe("Checking visualization with variants", () => {

                var jsonData, jsonStatsData;

                beforeAll(async (done) => {
                    setStorageValuestoMockVariantsDisplaying();
                    await display("tests/data/" + project + ".json", "tests/data/" + project + "-stats.json", []);
                    const [graph, stats] = await getJsonData("tests/data/" + project + ".json", "tests/data/" + project + "-stats.json");
                    jsonData = graph;
                    jsonStatsData = stats;
                    done();
                });

                it('Every VP or variant node is visible', () => {
                    expect(jsonData.nodes
                        .filter(n => ["VP", "METHOD_LEVEL_VP", "VARIANT"].some(label => n.types.includes(label)))
                        .map(n => d3.select('circle[name = "' + n.name + '"]'))
                        .every(c => c.attr("r") >= 10))
                        .toBeTruthy();
                });

                afterAll(() => sessionStorage.clear())

            });

        });

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

function setStorageValuestoMockVariantsDisplaying() {
    sessionStorage.setItem("firstTime", "false");
    sessionStorage.setItem("filteredIsolated", "false");
    sessionStorage.setItem("filteredVariants", "false");
}