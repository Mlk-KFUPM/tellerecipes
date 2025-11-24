import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppState } from '../../context/AppStateContext.jsx';
import ChefEngagementSection from '../../components/chef/ChefEngagementSection.jsx';

const ChefAnalyticsPage = () => {
  const { chefProfile, chefRecipeSummaries, chefEngagement } = useAppState();

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Publish recipes to unlock analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Once your chef account is approved and you publish recipes, TellerRecipes will track views, saves, and ratings here.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Understand how diners discover and interact with your recipes over time.
        </Typography>
      </Stack>

      <ChefEngagementSection engagement={chefEngagement} recipes={chefRecipeSummaries} />
    </Stack>
  );
};

export default ChefAnalyticsPage;
