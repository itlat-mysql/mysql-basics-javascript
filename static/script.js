document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const searchButton = document.getElementById('search-products');
    const enterCode = 13;

    if (!productsContainer || !searchButton) {
        return;
    }
    searchButton.addEventListener('click', performTableSearch);
    productsContainer.querySelectorAll('.search-param').forEach((element) => {
        element.addEventListener('keydown', (e) => {
            if (parseInt(e.keyCode) === enterCode) {
                performTableSearch();
            }
        });
    });

    function performTableSearch() {
        let link = searchButton.getAttribute('data-js-search-route');
        let fields = [...productsContainer.querySelectorAll('.search-param')]
        .map((elem) => {
            let name = elem.getAttribute('name');
            let value = elem.value;
            return encodeURIComponent(name) + '=' + encodeURIComponent(value);
        });

        link += ((link.indexOf('?') === -1) ? '?' : '&') + fields.join('&');
        location.assign(link);
    }
});