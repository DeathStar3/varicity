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

describe("Checking instantiation link when composing using fields", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/composition_levels_inheritance.json", "tests/data/composition_levels_inheritance-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be 3 INSTANTIATE links', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE").length).toBe(3);
    });

    it('there should be an INSTANTIATE link between RootClass and Composed1', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE" && l.source === "RootClass" && l.target === "Composed1").length).toBe(1);
    });

    it('there should be an INSTANTIATE link between Composed1 and Composed2', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE" && l.source === "Composed1" && l.target === "Composed2").length).toBe(1);
    });

    it('there should be an INSTANTIATE link between Composed1 and Composed3', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE" && l.source === "Composed1" && l.target === "Composed3").length).toBe(1);
    });

});

describe("Checking instantiation link when composing using method parameters", () => {

    var jsonData, jsonStatsData;

    beforeAll(async (done) => {
        const [graph, stats] = await getJsonData("tests/data/composition_levels_mixed.json", "tests/data/composition_levels_mixed-stats.json");
        jsonData = graph;
        jsonStatsData = stats;
        done();
    });

    it('there should be 3 INSTANTIATE links', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE").length).toBe(3);
    });

    it('there should be an INSTANTIATE link between RootClass and Composed1', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE" && l.source === "RootClass" && l.target === "Composed1").length).toBe(1);
    });

    it('there should be an INSTANTIATE link between Composed1 and Composed2', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE" && l.source === "Composed1" && l.target === "Composed2").length).toBe(1);
    });

    it('there should be an INSTANTIATE link between Composed1 and Composed3', () => {
        expect(jsonData.alllinks.filter(l => l.type === "INSTANTIATE" && l.source === "Composed1" && l.target === "Composed3").length).toBe(1);
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