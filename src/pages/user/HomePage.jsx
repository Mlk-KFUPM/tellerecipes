import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import RecipeSearchControls from '../../components/recipes/RecipeSearchControls.jsx';
import RecipeGrid from '../../components/recipes/RecipeGrid.jsx';
import CollectionSelectorDialog from '../../components/collections/CollectionSelectorDialog.jsx';
import { useAppDispatch, useAppState, selectFilters } from '../../context/AppStateContext.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { recipeSummaries, user } = state;
  const { cuisines, dietary } = selectFilters(state);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [collectionDialog, setCollectionDialog] = useState({ open: false, recipe: null });
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const filteredRecipes = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();
    return recipeSummaries.filter((recipe) => {
      const matchesSearch = normalisedSearch
        ? recipe.title.toLowerCase().includes(normalisedSearch) ||
          recipe.ingredients.some((ingredient) => ingredient.name.toLowerCase().includes(normalisedSearch))
        : true;
      const matchesCuisine = selectedCuisine ? recipe.cuisine === selectedCuisine : true;
      const matchesDietary = selectedDietary.length
        ? selectedDietary.every((tag) => recipe.dietary.includes(tag))
        : true;
      return matchesSearch && matchesCuisine && matchesDietary;
    });
  }, [recipeSummaries, searchTerm, selectedCuisine, selectedDietary]);

  const handleOpenRecipe = (recipe) => {
    navigate(`/app/recipes/${recipe.id}`);
  };

  const handleOpenCollections = (recipe) => {
    setCollectionDialog({ open: true, recipe });
  };

  const handleAddToShoppingList = (recipe) => {
    dispatch({ type: 'ADD_RECIPE_TO_SHOPPING_LIST', payload: { recipeId: recipe.id } });
    setFeedback({ open: true, message: `${recipe.title} added to shopping list`, severity: 'success' });
  };

  const handleDialogClose = () => setCollectionDialog({ open: false, recipe: null });

  const handleSaveToCollections = ({ selectedIds, newCollection }) => {
    const recipeId = collectionDialog.recipe?.id;
    if (!recipeId) {
      return;
    }

    let updatedCollectionIds = selectedIds;

    if (newCollection) {
      const collectionId = `collection-${Date.now()}`;
      dispatch({ type: 'CREATE_COLLECTION', payload: { id: collectionId, name: newCollection, recipeIds: [recipeId] } });
      updatedCollectionIds = [...selectedIds, collectionId];
    }

    dispatch({ type: 'SAVE_RECIPE_TO_COLLECTIONS', payload: { recipeId, collectionIds: updatedCollectionIds } });

    setFeedback({ open: true, message: `${collectionDialog.recipe.title} saved`, severity: 'success' });
    handleDialogClose();
  };

  const handleCreateCollection = async (name) => {
    const id = `collection-${Date.now()}`;
    dispatch({ type: 'CREATE_COLLECTION', payload: { id, name, recipeIds: [] } });
    return id;
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCuisine(null);
    setSelectedDietary([]);
  };

  const defaultSelectedCollections = collectionDialog.recipe
    ? user.collections.filter((collection) => collection.recipeIds.includes(collectionDialog.recipe.id)).map((c) => c.id)
    : [];

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Discover recipes for your next meal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse curated recipes, tailor filters to your preferences, and save favourites to collections.
        </Typography>
      </Stack>

      <RecipeSearchControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cuisineOptions={cuisines}
        dietaryOptions={dietary}
        selectedCuisine={selectedCuisine}
        selectedDietary={selectedDietary}
        onCuisineChange={setSelectedCuisine}
        onDietaryChange={setSelectedDietary}
        onReset={handleResetFilters}
      />

      <RecipeGrid
        recipes={filteredRecipes}
        onOpenRecipe={handleOpenRecipe}
        onSaveRecipe={handleOpenCollections}
        onAddToList={handleAddToShoppingList}
      />

      <CollectionSelectorDialog
        open={collectionDialog.open}
        onClose={handleDialogClose}
        onSave={handleSaveToCollections}
        onCreateCollection={handleCreateCollection}
        collections={user.collections}
        defaultSelected={defaultSelectedCollections}
      />

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback.severity} variant="filled" sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default HomePage;
