import { useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../context/AuthContext.jsx';
import ChefEngagementSection from '../../components/chef/ChefEngagementSection.jsx';
import { fetchProfile, listAnalytics } from '../../api/chef.js';

const ChefAnalyticsPage = () => {
  const { token } = useAuth();
  const [chefProfile, setChefProfile] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, analyticsRes] = await Promise.all([fetchProfile(token), listAnalytics(token)]);
        setChefProfile({ ...profileRes, id: profileRes._id || profileRes.id });
        const mapped = (analyticsRes.items || analyticsRes || []).map((r) => ({
          ...r,
          id: r._id || r.id,
        }));
        setAnalytics(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const engagement = useMemo(() => {
    const totals = { views: 0, saves: 0, averageRating: 0, ratingsCount: 0 };
    if (!analytics.length) return { totals, recipeStats: {} };
    let ratingSum = 0;
    const recipeStats = {};
    analytics.forEach((r) => {
      const count = r.ratingSummary?.count || 0;
      const avg = r.ratingSummary?.average || 0;
      totals.views += r.engagement?.views || 0;
      totals.saves += r.engagement?.saves || 0;
      totals.ratingsCount += count;
      ratingSum += count * avg;
      recipeStats[r.id] = {
        views: r.engagement?.views || 0,
        saves: r.engagement?.saves || 0,
        averageRating: avg,
        ratingsCount: count,
        comments: r.reviews?.length || 0,
      };
    });
    totals.averageRating = totals.ratingsCount ? Number((ratingSum / totals.ratingsCount).toFixed(1)) : 0;
    return { totals, recipeStats };
  }, [analytics]);

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading analytics...
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

      <ChefEngagementSection engagement={engagement} recipes={analytics} />
    </Stack>
  );
};

export default ChefAnalyticsPage;
