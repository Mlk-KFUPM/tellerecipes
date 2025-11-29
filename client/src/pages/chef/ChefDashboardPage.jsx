import { useEffect, useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchProfile, listRecipes, listAnalytics } from '../../api/chef.js';

const ChefDashboardPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [chefProfile, setChefProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, recipesRes, analyticsRes] = await Promise.allSettled([
          fetchProfile(token),
          listRecipes(token),
          listAnalytics(token),
        ]);
        if (profileRes.status === 'fulfilled') setChefProfile(profileRes.value);
        if (recipesRes.status === 'fulfilled') {
          const mapped = (recipesRes.value.items || recipesRes.value || []).map((r) => ({
            ...r,
            id: r._id || r.id,
            dietary: r.dietary || [],
            ingredients: r.ingredients || [],
            steps: r.steps || [],
          }));
          setRecipes(mapped);
        }
        if (analyticsRes.status === 'fulfilled') {
          const mapped = (analyticsRes.value.items || analyticsRes.value || []).map((r) => ({
            ...r,
            id: r._id || r.id,
          }));
          setAnalytics(mapped);
        }
      } catch (err) {
        setError(err.message || 'Failed to load chef data');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const engagementTotals = useMemo(() => {
    const totals = { views: 0, saves: 0, averageRating: 0, ratingsCount: 0 };
    if (!analytics.length) return totals;
    let ratingSum = 0;
    analytics.forEach((r) => {
      totals.views += r.engagement?.views || 0;
      totals.saves += r.engagement?.saves || 0;
      const count = r.ratingSummary?.count || 0;
      const avg = r.ratingSummary?.average || 0;
      totals.ratingsCount += count;
      ratingSum += count * avg;
    });
    totals.averageRating = totals.ratingsCount ? Number((ratingSum / totals.ratingsCount).toFixed(1)) : 0;
    return totals;
  }, [analytics]);

  const publishedRecipes = recipes.filter((recipe) => recipe.status === 'approved');
  const pendingRecipes = recipes.filter((recipe) => recipe.status !== 'approved');

  const latestReview = useMemo(() => {
    const allReviews = recipes.flatMap((recipe) =>
      (recipe.reviews || []).map((review) => ({
        ...review,
        recipeTitle: recipe.title,
      })),
    );
    if (!allReviews.length) {
      return null;
    }
    return allReviews.sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())[0];
  }, [recipes]);

  const isPending = chefProfile && chefProfile.status !== 'approved';

  if (loading) {
    return (
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Loading chef workspace...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Become a TellerRecipes chef
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have not submitted a chef application yet. Start by sharing your story and experience so our team can approve your contributor account.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/app/become-chef')} sx={{ alignSelf: 'flex-start' }}>
          Apply now
        </Button>
      </Stack>
    );
  }

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
              {engagementTotals?.saves?.toLocaleString() ?? '0'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {engagementTotals?.views ? `${engagementTotals.views.toLocaleString()} total views` : 'Share your first recipe to generate engagement'}
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
                {Number(engagementTotals?.averageRating ?? 0).toFixed(1)}
              </Typography>
              <Rating size="small" value={Number(engagementTotals?.averageRating ?? 0)} precision={0.1} readOnly />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {engagementTotals?.ratingsCount ? `${engagementTotals.ratingsCount} diner ratings` : 'Collect reviews to build trust'}
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
