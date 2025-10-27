import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CollectionCard from '../../components/collections/CollectionCard.jsx';
import { useAppDispatch, useAppState } from '../../context/AppStateContext.jsx';

const CollectionsPage = () => {
  const { user, recipeSummaries } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');

  const handleCreateCollection = () => {
    if (!collectionName.trim()) {
      return;
    }
    const id = `collection-${Date.now()}`;
    dispatch({ type: 'CREATE_COLLECTION', payload: { id, name: collectionName.trim(), recipeIds: [] } });
    setCollectionName('');
    setDialogOpen(false);
  };

  const handleViewRecipe = (recipeId) => {
    navigate(`/app/recipes/${recipeId}`);
  };

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
        <Stack spacing={1}>
          <Typography variant="h4">Your collections</Typography>
          <Typography variant="body1" color="text.secondary">
            Group favourite recipes into themed collections for quick access.
          </Typography>
        </Stack>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          New collection
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {user.collections.map((collection) => {
          const recipes = recipeSummaries.filter((recipe) => collection.recipeIds.includes(recipe.id));
          return (
            <Grid item xs={12} md={6} key={collection.id}>
              <CollectionCard collection={collection} recipes={recipes} onViewRecipe={handleViewRecipe} />
            </Grid>
          );
        })}
        {!user.collections.length && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              You have no collections yet. Create one to start saving recipes.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Create a new collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection name"
            fullWidth
            value={collectionName}
            onChange={(event) => setCollectionName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCollection} disabled={!collectionName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CollectionsPage;
