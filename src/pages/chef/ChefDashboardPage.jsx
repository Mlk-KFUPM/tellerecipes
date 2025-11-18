import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import dayjs from 'dayjs';
import { useAppState } from '../../context/AppStateContext.jsx';

const ChefDashboardPage = () => {
  const navigate = useNavigate();
  const { chefProfile, chefRecipeSummaries, chefEngagement } = useAppState();

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Become a TellerRecipes chef
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have not submitted a chef application yet. Start by sharing your story and experience so our team can approve your contributor account.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/auth/become-chef')} sx={{ alignSelf: 'flex-start' }}>
          Apply now
        </Button>
      </Stack>
    );
  }

  const totals = chefEngagement?.totals;
  const publishedRecipes = chefRecipeSummaries.filter((recipe) => recipe.status === 'approved');
  const pendingRecipes = chefRecipeSummaries.filter((recipe) => recipe.status !== 'approved');

  const latestReview = useMemo(() => {
    const allReviews = chefRecipeSummaries.flatMap((recipe) =>
      (recipe.reviews || []).map((review) => ({
        ...review,
        recipeTitle: recipe.title,
      })),
    );
    if (!allReviews.length) {
      return null;
    }
    return allReviews.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())[0];
  }, [chefRecipeSummaries]);

  const isPending = chefProfile.status !== 'approved';

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Chef workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track what&apos;s happening with your recipes and jump into the tools you use most.
        </Typography>
      </Stack>

      {isPending && (
        <Alert severity="warning">
          Your chef profile is currently {chefProfile.status}. We&apos;ll notify you as soon as it is approved. You can continue polishing your profile
          in the meantime.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              Published recipes
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {publishedRecipes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pendingRecipes.length > 0 ? `${pendingRecipes.length} awaiting approval` : 'All updates are live'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              Saves & favourites
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {totals?.saves?.toLocaleString() ?? '0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totals?.views ? `${totals.views.toLocaleString()} total views` : 'Share your first recipe to generate engagement'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            variant="outlined"
            sx={{ p: 2.5, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              Average rating
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {Number(totals?.averageRating ?? 0).toFixed(1)}
              </Typography>
              <Rating size="small" value={Number(totals?.averageRating ?? 0)} precision={0.1} readOnly />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {totals?.ratingsCount ? `${totals.ratingsCount} diner ratings` : 'Collect reviews to build trust'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Quick actions
              </Typography>
              <Stack spacing={1}>
                <Button variant="contained" onClick={() => navigate('/app/chef/recipes')}>
                  Create or update a recipe
                </Button>
                <Button variant="outlined" onClick={() => navigate('/app/chef/profile')}>
                  Refine public profile
                </Button>
                <Button variant="text" onClick={() => navigate('/app/chef/analytics')} sx={{ alignSelf: 'flex-start' }}>
                  View detailed analytics
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Latest review
              </Typography>
              {latestReview ? (
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {latestReview.author}
                    </Typography>
                    <Rating value={latestReview.rating} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(latestReview.createdAt).format('MMM D, YYYY')}
                    </Typography>
                  </Stack>
                  <Chip label={latestReview.recipeTitle} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Typography variant="body2">{latestReview.comment}</Typography>
                  <Button variant="text" size="small" onClick={() => navigate('/app/chef/reviews')} sx={{ alignSelf: 'flex-start' }}>
                    Reply to diners
                  </Button>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  You don&apos;t have any reviews yet. Encourage diners to leave feedback to build momentum.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ChefDashboardPage;
