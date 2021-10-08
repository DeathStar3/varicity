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

import {Filter} from "./filter.js";

/**
 * This filter removes nodes being isolated, meaning that they are not linked to any other node.
 */
class IsolatedFilter extends Filter {

    constructor(nodesList, linksList) {
        super(nodesList, linksList);

        this.getFilteredNodesList = () => {
            var nodesToKeep = new Set();
            this.linksList.forEach(l => {
                nodesToKeep.add(l.source);
                nodesToKeep.add(l.target);
            });
            return this.nodesList.filter(n => nodesToKeep.has(n.name));
        };

        this.getFilteredLinksList = () => {
            return this.linksList;
        }

    }

}

export {IsolatedFilter};