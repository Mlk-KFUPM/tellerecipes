import { useEffect, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext.jsx';
import { listCollections, createCollection, updateCollection, deleteCollection, getRecipe } from '../../api/user.js';

const CollectionsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        const [collectionsRes] = await Promise.all([listCollections(token)]);
        const mappedCollections = (collectionsRes.items || collectionsRes || []).map((c) => ({
          ...c,
          id: c._id || c.id,
          recipeIds: (c.recipeIds || []).map((rid) => rid.toString()),
        }));
        setCollections(mappedCollections);
      } catch (err) {
        console.error('Failed to load collections', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    const loadRecipes = async () => {
      const ids = collections.flatMap((c) => c.recipeIds);
      const uniqueMissing = Array.from(new Set(ids.filter((id) => !recipes[id])));
      if (!uniqueMissing.length) return;
      await Promise.all(
        uniqueMissing.map(async (id) => {
          try {
            const data = await getRecipe(id);
            const mapped = { ...data, id: data._id || data.id, dietary: data.dietary || [], ingredients: data.ingredients || [] };
            setRecipes((prev) => ({ ...prev, [mapped.id]: mapped }));
          } catch (err) {
            console.error('Failed to load recipe', id, err);
          }
        }),
      );
    };
    if (token && collections.length) {
      loadRecipes();
    }
  }, [collections, token, recipes]);

  const fetchRecipeIfNeeded = async (id) => {
    if (recipes[id]) return recipes[id];
    const data = await getRecipe(id);
    const mapped = { ...data, id: data._id || data.id, dietary: data.dietary || [], ingredients: data.ingredients || [] };
    setRecipes((prev) => ({ ...prev, [mapped.id]: mapped }));
    return mapped;
  };

  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      return;
    }
    try {
      const created = await createCollection(token, { name: collectionName.trim() });
      const mapped = { ...created, id: created._id || created.id, recipeIds: [] };
      setCollections((prev) => [...prev, mapped]);
      setCollectionName('');
      setDialogOpen(false);
    } catch (err) {
      console.error('Failed to create collection', err);
    }
  };

  const handleViewRecipe = (recipeId) => {
    navigate(`/app/user/recipes/${recipeId}`);
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
        {collections.map((collection) => {
          const collectionRecipes = collection.recipeIds
            .map((rid) => recipes[rid])
            .filter(Boolean);
          return (
            <Grid item xs={12} md={6} key={collection.id}>
              <CollectionCard collection={collection} recipes={collectionRecipes} onViewRecipe={handleViewRecipe} />
            </Grid>
          );
        })}
        {!loading && !collections.length && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              You have no collections yet. Create one to start saving recipes.
            </Typography>
          </Grid>
        )}
        {loading && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Loading collections...
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
