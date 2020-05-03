import { elements } from './base';

export const clearInput = () => {
  elements.searchInput.value = '';
};

export const getInput = () => elements.searchInput.value;

export const clearResults = () => {
  elements.searchResultList.innerHTML = '';
  elements.searchResultPages.innerHTML = '';
};

export const highlightSelected = (id) => {
  const resultsArr = Array.from(document.querySelectorAll('.results__link'));
  resultsArr.forEach((el) => el.classList.remove('results__link--active'));

  document
    .querySelector(`a[href="#${id}"]`)
    .classList.add('results__link--active');
};

/**
 * Private methods.
 */

const renderRecipe = (recipe) => {
  const markup = `
  <li>
  <a class="results__link" href="#${recipe.recipe_id}">
      <figure class="results__fig">
          <img src="${recipe.image_url}" alt="${recipe.title}">
      </figure>
      <div class="results__data">
          <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
          <p class="results__author">${recipe.publisher}</p>
      </div>
  </a>
</li>  
`;

  elements.searchResultList.insertAdjacentHTML('beforeend', markup);
};

const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];

  if (title.length > limit) {
    title.split(' ').reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);

    // Return the result
    return `${newTitle.join(' ')} ...`;
  }

  return title;
};

// Type: 'prev' or 'next';
const createButton = (page, type) => `

   <button class="btn-inline results__btn--${type}" data-goto="${
  type === 'prev' ? page - 1 : page + 1
}">
<span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
      <svg class="search__icon">
          <use href="img/icons.svg#icon-triangle-${
            type === 'prev' ? 'left' : 'right'
          }"></use>
      </svg>
   </button>
`;

const renderButtons = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);
  let button;

  if (page === 1 && pages > 1) {
    // Button go to next page ONLY
    button = createButton(page, 'next');
  } else if (page < pages) {
    // Both buttons
    button = `
    ${createButton(page, 'prev')}
    ${createButton(page, 'next')}
    `;
  } else if (page === pages && pages > 1) {
    // Only for last page
    button = createButton(page, 'prev');
  }

  elements.searchResultPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
  //   Render results of current page
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;

  recipes.slice(start, end).forEach(renderRecipe);

  //   Render the pagination buttons
  renderButtons(page, recipes.length, resPerPage);
};
