export function getFilters() {
    const filters = {};

    const age = document.querySelector('#age-filter select').value;
    const region = document.querySelector('#region-filter select').value;
    const gender = document.querySelector('#gender-filter select').value;
    const favourites = document.querySelector('#favourites input').checked;

    if (age !== 'All') {
        filters.age = age;
    }

    if (region !== 'All') {
        filters.country = region;
    }

    if (gender !== 'All') {
        filters.gender = gender;
    }

    if (favourites) {
        filters.favorite = favourites;
    }

    //if (Object.keys(filters).length === 0 && filters.constructor === Object) clearSearchBar();

    return filters;
}

export function getFavoriteFilter() {
    return document.querySelector('#favourites input').checked;
}


function clearSearchBar() {
    document.querySelector('.site-search').value = '';
}

export function clearFilters(options = { silent: false }) {
    const filterSelects = document.querySelectorAll('.search-filters select');

    filterSelects.forEach(select => {
        select.selectedIndex = 0;
    
        if (!options.silent) {
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    })

    const filterChecks = document.querySelectorAll('.search-filters input');
    filterChecks.forEach(input => {
        input.checked = false;

        input.dispatchEvent(new Event('change', { bubbles: true }));
    })
}