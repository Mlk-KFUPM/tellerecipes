import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchProfile, listRecipes, createRecipe, updateRecipe, deleteRecipe } from '../../api/chef.js';
import ChefRecipeManager from '../../components/chef/ChefRecipeManager.jsx';

const ChefRecipesPage = () => {
  const { token } = useAuth();
  const [chefProfile, setChefProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, recipesRes] = await Promise.all([fetchProfile(token), listRecipes(token)]);
        setChefProfile({ ...profileRes, id: profileRes._id || profileRes.id });
        const mapped = (recipesRes.items || recipesRes || []).map((r) => ({
          ...r,
          id: r._id || r.id,
          dietary: r.dietary || [],
          ingredients: r.ingredients || [],
          steps: r.steps || [],
        }));
        setRecipes(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load chef data');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const handleCreate = async (payload) => {
    const res = await createRecipe(token, payload);
    const created = { ...payload, id: res.id || res._id, status: res.status || 'pending', updatedAt: new Date().toISOString() };
    setRecipes((prev) => [...prev, created]);
  };

  const handleUpdate = async (recipeId, changes) => {
    const res = await updateRecipe(token, recipeId, changes);
    setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, ...changes, ...res, id: res._id || res.id || recipeId } : r)));
  };

  const handleDelete = async (recipeId) => {
    await deleteRecipe(token, recipeId);
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading recipes...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          You need a chef profile to publish recipes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit your chef application to unlock the recipe editor and start sharing your dishes with the community.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Recipes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Draft, submit, and update the recipes in your TellerRecipes portfolio.
        </Typography>
      </Stack>

      <ChefRecipeManager
        recipes={recipes}
        profileStatus={chefProfile.status}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Stack>
  );
};

export default ChefRecipesPage;
