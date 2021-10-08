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

import {NodesFilter} from "./nodes-filter.js";


/**
 * This filter removes nodes which do not use a class of the API. Meaning that the graph will only show the API classes and other classes which use them.
 */
class ApiFilter extends NodesFilter {

    constructor(filterButtonSelector, filterInputSelector, filtersListSelector, nodeFilters, displayGraphFunction) {
        super(filterButtonSelector, filterInputSelector, filtersListSelector, nodeFilters, displayGraphFunction);
    }

    addFilterTitle(){
        console.log(this.filtersList);
        if(this.filtersList.length === 0) {
            $(this.filtersListSelector).append('<h5 id="apiFilterTitle" style="text-align: center; font-weight: bold">Api classes filtered</h5>');
        }
    }

    updateFiltersNumber(){
        document.getElementById('output').innerHTML = this.filtersList.length.toString();
    }

    //You can actually add in the api filters input field some nodes names separated by ',' to get them added to the apiFilter's list
    addFilteringToButton() {
        $(this.filterButtonSelector).on('click', async e => {
            e.preventDefault();
            let input = $(this.filterInputSelector);
            let inputValue = input.val();
            var as = inputValue.split(',');
            input.val("");
            as.forEach(element=> this.addFilter(element.trim()));
            await this.displayGraphFunction();
        });
    }

    //This method from nodeFilter have been override to separate the two list apiFilter's list and packageFilter 's list
    addCapacityToRemoveFilter(){
        $(document).on('click', "#close-api", async e => {
            e.preventDefault();
            let removedFilter = $(e.target.parentElement.parentElement).attr("id");
            $(e.target.parentElement.parentElement).remove();
            this.removeValue(removedFilter);
            await this.displayGraphFunction();
        });
    }

    getFilterItem(filter) {
        return '' +
            '<li class="list-group-item d-flex justify-content-between align-items-center" id="' + filter + '" data-toggle="list"\n' +
            '               role="tab" aria-controls="profile">'
            + filter +
            '<button id="close-api" type="button btn-dark" class="close" aria-label="Close">\n' +
            '  <span aria-hidden="true">&times;</span>\n' +
            '</button>' +
            '</li>';
    }



    //Find links whose target or sources match with nodes in the initial list

    getLinksListWithMatchingFilterIn(listToFilter){
        return listToFilter.filter(l => this.filtersList.some(filter => NodesFilter.matchesFilter(l.target, filter)))
    }

    getLinksListWithMatchingFilterOut(listToFilter){
        return listToFilter.filter(l => this.filtersList.some(filter => NodesFilter.matchesFilter(l.source, filter)))
    }

    getLinksListWithMatchingFilterInOut(listToFilter){
        return listToFilter.filter(l => this.filtersList.some(filter => NodesFilter.matchesFilter(l.target, filter) || NodesFilter.matchesFilter(l.source, filter)) )
    }



    //Find links whose target or sources match with nodes in a given list

    getLinksListWithMatchingFiltersIn(listToFilter, filters){
        return listToFilter.filter(l => filters.some(filter => NodesFilter.matchesFilter(l.target, filter)))
    }

    getLinksListWithMatchingFiltersOut(listToFilter, filters){
        return listToFilter.filter(l => filters.some(filter => NodesFilter.matchesFilter(l.source, filter)))
    }

    getLinksListWithMatchingFiltersInOut(listToFilter, filters){
        return listToFilter.filter(l => filters.some(filter => NodesFilter.matchesFilter(l.target, filter) || NodesFilter.matchesFilter(l.source, filter)) )
    }

    //Find nodes matching with the nodes in the list to filter
    getNodesListWithMatchingFilter(listToFilter){
        return listToFilter.filter(n => this.filtersList.some(filter => NodesFilter.matchesFilter(n.name, filter)))
    }

}

export {ApiFilter};