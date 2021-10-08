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

describe("Sample test", () => {

    beforeAll(async () => {
        await display("tests/data/composition_levels_inheritance.json", "tests/data/composition_levels_inheritance-stats.json", [], [], 1, "IN");
        setTimeout(() => done(), 500); // wait for onclick event to execute totally
    });

    it('svg should exist', () => {
        var svg = document.getElementsByTagName('svg');
        expect(svg).not.toBe(null);
    });
    it('the generated graph should contain one node', async () => {
        expect(d3.select('circle[name = "Composed2"]').empty()).toBeFalsy();
    });

});