import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import * as listView from './view/listView';
import * as likesView from './view/likesView';
import { elements, renderLoader, clearLoader } from './view/base';

/**
 * Global state of the app
 *  - Search object
 *  - Current recipe object
 *  - Shopping list object
 *  - Liked recipes
 */

const state = {};
window.state = state;

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
      console.log(err);
      alert('Error processing recipe!');
    }
  }
};

['hashchange', 'load'].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

/**
 * THE LIST CONTROLLER
 */

const controlList = () => {
  // If LIST NOT exist
  if (!state.list) state.list = new List();

  // Add ingredients to the list
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', ($event) => {
  const id = $event.target.closest('.shopping__item').dataset.itemid;

  // Handle the delete button
  if ($event.target.matches('.shopping__delete, .shopping__delete *')) {
    // Delete from state
    state.list.deleteItem(id);

    // Delete from the UI
    listView.deleteItem(id);

    // Handle the count update
  } else if ($event.target.matches('.shopping__count-value')) {
    const val = parseFloat($event.target.value);
    state.list.updateCount(id, val);
  }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();

  const currentID = state.recipe.id;

  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add the like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // Toggle the like button
    likesView.toggleLikeBtn(true);

    // Add like to the UI list
    console.log(state.likes);

    // User HAS yet liked current recipe
  } else {
    state.likes.deleteLike(currentID);

    likesView.toggleLikeBtn(false);

    console.log(state.likes);
  }
};

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
  } else if ($event.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to the shop list
    controlList();
  } else if ($event.target.matches('.recipe__love, .recipe__love *')) {
    // Like controller
    controlLike();
  }
});
