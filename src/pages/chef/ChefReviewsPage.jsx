import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppState } from '../../context/AppStateContext.jsx';
import ChefReviewsSection from '../../components/chef/ChefReviewsSection.jsx';

const ChefReviewsPage = () => {
  const { chefProfile, chefRecipeSummaries } = useAppState();

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Reviews will appear once your chef profile is approved
        </Typography>
        <Typography variant="body1" color="text.secondary">
          After you join as a chef and publish recipes, diner reviews will show up here for follow-up and replies.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Reviews & replies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Keep diners engaged by thanking them, answering questions, and offering helpful swaps.
        </Typography>
      </Stack>

      <ChefReviewsSection recipes={chefRecipeSummaries} chefName={chefProfile.displayName} />
    </Stack>
  );
};

export default ChefReviewsPage;
