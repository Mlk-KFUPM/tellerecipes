import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppState } from '../../context/AppStateContext.jsx';
import ChefRecipeManager from '../../components/chef/ChefRecipeManager.jsx';

const ChefRecipesPage = () => {
  const { chefProfile, chefRecipeSummaries } = useAppState();

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

      <ChefRecipeManager recipes={chefRecipeSummaries} profileStatus={chefProfile.status} />
    </Stack>
  );
};

export default ChefRecipesPage;
