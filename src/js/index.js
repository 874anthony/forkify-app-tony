import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import { elements, renderLoader, clearLoader } from './view/base';

/**
 * Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */

const state = {};

/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
  // 1) Get the query from the view
  const query = searchView.getInput(); //TODO
  // console.log(query);

  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);

    // 3) Prepare the UI loader
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Search for recipes
      await state.search.getResults();
      clearLoader();

      // 5) Render results on the UI
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert('Something wrong with the search...');
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener('submit', ($event) => {
  $event.preventDefault();
  controlSearch();
});

elements.searchResultPages.addEventListener('click', ($event) => {
  const btn = $event.target.closest('.btn-inline');

  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
    // console.log(goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */

const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Hihhlight the selected recipe
    if (state.search) searchView.highlightSelected(id);

    // Create new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Create servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (err) {
      alert('Error processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

// Handling recipe button clicks
elements.recipe.addEventListener('click', ($event) => {
  if ($event.target.matches('.btn-decrease, .btn-decrease *')) {
    // Decreased button is clicked

    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if ($event.target.matches('.btn-increase, .btn-increase *')) {
    // Increase button is clicked
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  }

  // console.log(state.recipe);
});
