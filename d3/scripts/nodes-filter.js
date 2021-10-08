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

/* Class allowing to easily create a logic allowing to process nodes whose name matches a pattern. */

class NodesFilter {

    constructor(filterButtonSelector, filterInputSelector, filtersListSelector, nodeFilters, displayGraphFunction) {
        this.filterButtonSelector = filterButtonSelector;
        this.filterInputSelector = filterInputSelector;
        this.filtersListSelector = filtersListSelector;
        this.displayGraphFunction = displayGraphFunction;
        this.addFilteringToButton();
        this.addCapacityToRemoveFilter();
        this.filtersList = [];
        nodeFilters.forEach(n => this.addFilter(n))
    }

    addFilterTitle(){
        //console.log(this.filtersList);
        if(this.filtersList.length === 0) {
            $(this.filtersListSelector).append('<h5 id="filterTitle" style="text-align: center; font-weight: bold">Packages filtered</h5>');
        }
    }

    updateFiltersNumber(){
        document.getElementById('output-p').innerHTML = this.filtersList.length.toString();
    }

    removeFilterTitle(){
        //console.log(this.filtersList);
        if(this.filtersList.length === 0) {
            $(this.filtersListSelector).empty();
        }
    }

    addFilteringToButton() {
        $(this.filterButtonSelector).on('click', async e => {
            e.preventDefault();
            let input = $(this.filterInputSelector);
            let inputValue = input.val();
            input.val("");
            this.addFilter(inputValue);
            await this.displayGraphFunction();
        });
    }

    addCapacityToRemoveFilter(){
        $(document).on('click', "#close-package", async e => {
            e.preventDefault();
            let removedFilter = $(e.target.parentElement.parentElement).attr("id");
            //console.log(removedFilter);
            $(e.target.parentElement.parentElement).remove();
            this.removeValue(removedFilter);
            //this.removeFilterTitle();
            await this.displayGraphFunction();
        });
    }

    addFilter(value) {
        if (value) {
            //this.addFilterTitle();
            this.addValue(value);
            $(this.filtersListSelector).append(this.getFilterItem(value));
        }
    }

    addValue(value) {
        this.filtersList.push(value);
        //console.log(this.filtersList.length.toString());
        this.updateFiltersNumber();
    }

    removeValue(value) {
        this.filtersList.splice(this.filtersList.indexOf(value), 1);
        //console.log(this.filtersList.length.toString());
        this.updateFiltersNumber();
    }

    getFilterItem(filter) {
        return '' +
            '<li class="list-group-item d-flex justify-content-between align-items-center" id="' + filter + '" data-toggle="list"\n' +
            '               role="tab" aria-controls="profile">'
            + filter +
            '<button id="close-package" type="button btn-dark" class="close" aria-label="Close">\n' +
            '  <span aria-hidden="true">&times;</span>\n' +
            '</button>' +
            '</li>';
    }

    /**
     * If the filter is a class filter (distinguished by the fact that it contains at least an uppercase letter),
     * we check that the class name matches the filter exactly.
     * Otherwise, the filter is a package filter, so we check that the class name starts with the filter.
     */
    static matchesFilter(name, filter) {
        var sp = filter.split(".");
        return /[A-Z]/.test(sp[sp.length - 1]) ? name === filter : name.startsWith(filter);
    }

    getNodesListWithoutMatchingFilter(listToFilter){
        return listToFilter.filter(n => !this.filtersList.some(filter => NodesFilter.matchesFilter(n.name, filter)))
    }

    getLinksListWithoutMatchingFilter(listToFilter){
        return listToFilter.filter(l => !this.filtersList.some(filter => NodesFilter.matchesFilter(l.source, filter)) && !this.filtersList.some(filter => NodesFilter.matchesFilter(l.target, filter)))
    }

    async addFilterAndRefresh(value){
        this.addFilter(value);
        await this.displayGraphFunction();
    }

}

export { NodesFilter };
