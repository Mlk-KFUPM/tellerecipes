import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RecipeDetail from '../../components/recipes/RecipeDetail.jsx';
import ReviewList from '../../components/recipes/ReviewList.jsx';
import ReviewForm from '../../components/recipes/ReviewForm.jsx';
import CollectionSelectorDialog from '../../components/collections/CollectionSelectorDialog.jsx';
import { useAppDispatch, useAppState, selectRecipeById } from '../../context/AppStateContext.jsx';

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const state = useAppState();
  const dispatch = useAppDispatch();

  const recipe = useMemo(() => selectRecipeById(state, id), [state, id]);

  const [collectionDialog, setCollectionDialog] = useState({ open: false, recipe: null });
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  if (!recipe) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h5">Recipe not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Go back
        </Button>
      </Stack>
    );
  }

  const defaultSelectedCollections = state.user.collections
    .filter((collection) => collection.recipeIds.includes(recipe.id))
    .map((collection) => collection.id);

  const handleAddToShoppingList = (targetRecipe) => {
    dispatch({ type: 'ADD_RECIPE_TO_SHOPPING_LIST', payload: { recipeId: targetRecipe.id } });
    setFeedback({ open: true, message: `${targetRecipe.title} added to your shopping list`, severity: 'success' });
  };

  const handleOpenCollections = (targetRecipe) => {
    setCollectionDialog({ open: true, recipe: targetRecipe });
  };

  const handleSaveToCollections = ({ selectedIds, newCollection }) => {
    const recipeId = recipe.id;
    let collectionIds = selectedIds;
    if (newCollection) {
      const idValue = `collection-${Date.now()}`;
      dispatch({ type: 'CREATE_COLLECTION', payload: { id: idValue, name: newCollection, recipeIds: [recipeId] } });
      collectionIds = [...selectedIds, idValue];
    }
    dispatch({ type: 'SAVE_RECIPE_TO_COLLECTIONS', payload: { recipeId, collectionIds } });
    setFeedback({ open: true, message: `${recipe.title} saved to your collections`, severity: 'success' });
    setCollectionDialog({ open: false, recipe: null });
  };

  const handleCreateCollection = async (name) => {
    const idValue = `collection-${Date.now()}`;
    dispatch({ type: 'CREATE_COLLECTION', payload: { id: idValue, name, recipeIds: [] } });
    return idValue;
  };

  const handleSubmitReview = ({ rating, comment }) => {
    const review = {
      id: `review-${Date.now()}`,
      author: state.user.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_REVIEW', payload: { recipeId: recipe.id, review } });
    setFeedback({ open: true, message: 'Thank you for reviewing this recipe!', severity: 'success' });
  };

  return (
    <Stack spacing={6}>
      <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ alignSelf: 'flex-start' }}>
        Back to recipes
      </Button>

      <RecipeDetail recipe={recipe} onSave={handleOpenCollections} onAddToList={handleAddToShoppingList} />

      <Stack spacing={4}>
        <Typography variant="h5">Community reviews</Typography>
        <ReviewList reviews={recipe.reviews} />
        <ReviewForm onSubmit={handleSubmitReview} />
      </Stack>

      <CollectionSelectorDialog
        open={collectionDialog.open}
        onClose={() => setCollectionDialog({ open: false, recipe: null })}
        collections={state.user.collections}
        defaultSelected={defaultSelectedCollections}
        onSave={handleSaveToCollections}
        onCreateCollection={handleCreateCollection}
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

export default RecipeDetailPage;
