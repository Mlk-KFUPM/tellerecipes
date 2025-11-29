import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import RecipeSearchControls from '../../components/recipes/RecipeSearchControls.jsx';
import RecipeGrid from '../../components/recipes/RecipeGrid.jsx';
import CollectionSelectorDialog from '../../components/collections/CollectionSelectorDialog.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  listRecipes,
  toggleSaveRecipe,
  listCollections,
  createCollection,
  getShoppingList,
  updateShoppingList,
} from '../../api/user.js';

const HomePage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [collectionDialog, setCollectionDialog] = useState({ open: false, recipe: null });
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const cuisineOptions = useMemo(() => {
    const set = new Set();
    recipes.forEach((recipe) => recipe.cuisine && set.add(recipe.cuisine));
    return Array.from(set);
  }, [recipes]);

  const dietaryOptions = useMemo(() => {
    const set = new Set();
    recipes.forEach((recipe) => (recipe.dietary || []).forEach((tag) => set.add(tag)));
    return Array.from(set);
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const normalisedSearch = searchTerm.trim().toLowerCase();
    return recipes.filter((recipe) => {
      const matchesSearch = normalisedSearch
        ? recipe.title.toLowerCase().includes(normalisedSearch) ||
          (recipe.ingredients || []).some((ingredient) => ingredient.name.toLowerCase().includes(normalisedSearch))
        : true;
      const matchesCuisine = selectedCuisine ? recipe.cuisine === selectedCuisine : true;
      const matchesDietary = selectedDietary.length
        ? selectedDietary.every((tag) => (recipe.dietary || []).includes(tag))
        : true;
      return matchesSearch && matchesCuisine && matchesDietary;
    });
  }, [recipes, searchTerm, selectedCuisine, selectedDietary]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await listRecipes({
          search: searchTerm || undefined,
          cuisine: selectedCuisine || undefined,
          dietary: selectedDietary,
        });
        const mapped = (data.items || data.recipes || []).map((r) => ({
          ...r,
          id: r._id || r.id,
          dietary: r.dietary || [],
          ingredients: r.ingredients || [],
        }));
        setRecipes(mapped);
      } catch (err) {
        console.error('Failed to load recipes', err);
        setFeedback({ open: true, message: err.message || 'Failed to load recipes', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
    return () => controller.abort();
  }, [searchTerm, selectedCuisine, selectedDietary]);

  useEffect(() => {
    if (!token) return;
    const fetchUserData = async () => {
      try {
        const [collectionRes, shoppingRes] = await Promise.all([listCollections(token), getShoppingList(token)]);
        const mappedCollections = (collectionRes.items || collectionRes || []).map((c) => ({
          ...c,
          id: c._id || c.id,
          recipeIds: (c.recipeIds || []).map((rid) => rid.toString()),
        }));
        setCollections(mappedCollections);
        if (shoppingRes) {
          setShoppingList((shoppingRes.recipeIds || []).map((id) => id.toString()));
        }
      } catch (err) {
        console.error('Failed to load user data', err);
      }
    };
    fetchUserData();
  }, [token]);

  const handleOpenRecipe = (recipe) => {
    navigate(`/app/user/recipes/${recipe.id || recipe._id}`);
  };

  const handleOpenCollections = (recipe) => {
    setCollectionDialog({ open: true, recipe });
  };

  const handleAddToShoppingList = (recipe) => {
    if (!token) {
      setFeedback({ open: true, message: 'Please sign in to manage your shopping list', severity: 'info' });
      return;
    }
    const nextIds = Array.from(new Set([...shoppingList, recipe.id]));
    updateShoppingList(token, nextIds)
      .then((res) => {
        setShoppingList((res.recipeIds || []).map((id) => id.toString()));
        setFeedback({ open: true, message: `${recipe.title} added to shopping list`, severity: 'success' });
      })
      .catch((err) => {
        console.error('Add to shopping list failed', err);
        setFeedback({ open: true, message: err.message || 'Failed to add to shopping list', severity: 'error' });
      });
  };

  const handleDialogClose = () => setCollectionDialog({ open: false, recipe: null });

  const handleSaveToCollections = ({ selectedIds, newCollection }) => {
    const recipeId = collectionDialog.recipe?.id;
    if (!recipeId) {
      return;
    }

    let updatedCollectionIds = selectedIds;

    if (!token) {
      setFeedback({ open: true, message: 'Please sign in to save recipes', severity: 'info' });
      return;
    }

    const createAndSave = async () => {
      if (newCollection) {
        const newCol = await createCollection(token, { name: newCollection });
        updatedCollectionIds = [...selectedIds, newCol._id?.toString() || newCol.id];
        setCollections((prev) => [...prev, { ...newCol, id: newCol._id || newCol.id, recipeIds: [] }]);
      }
      const res = await toggleSaveRecipe(token, recipeId, { collectionIds: updatedCollectionIds });
      const updated = (res.collections || []).map((c) => ({
        ...c,
        id: c._id || c.id,
        recipeIds: (c.recipeIds || []).map((rid) => rid.toString()),
      }));
      setCollections(updated);
      setFeedback({ open: true, message: `${collectionDialog.recipe.title} saved`, severity: 'success' });
      handleDialogClose();
    };

    createAndSave().catch((err) => {
      console.error('Save to collections failed', err);
      setFeedback({ open: true, message: err.message || 'Failed to save recipe', severity: 'error' });
    });
  };

  const handleCreateCollection = async (name) => {
    if (!token) {
      setFeedback({ open: true, message: 'Please sign in to save recipes', severity: 'info' });
      return null;
    }
    const col = await createCollection(token, { name });
    const mapped = { ...col, id: col._id || col.id, recipeIds: [] };
    setCollections((prev) => [...prev, mapped]);
    return mapped.id;
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCuisine(null);
    setSelectedDietary([]);
  };

  const defaultSelectedCollections = collectionDialog.recipe
    ? collections
        .filter((collection) => collection.recipeIds.includes(collectionDialog.recipe.id))
        .map((c) => c.id)
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
        cuisineOptions={cuisineOptions}
        dietaryOptions={dietaryOptions}
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
        loading={loading}
      />

      <CollectionSelectorDialog
        open={collectionDialog.open}
        onClose={handleDialogClose}
        onSave={handleSaveToCollections}
        onCreateCollection={handleCreateCollection}
        collections={collections}
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
