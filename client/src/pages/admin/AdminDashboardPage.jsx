import { useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchDashboard, listRecipes } from '../../api/admin.js';

const StatCard = ({ label, value }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

const rangeOptions = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
];

const AdminDashboardPage = () => {
  const { token } = useAuth();
  const [selectedRange, setSelectedRange] = useState('30d');
  const [metrics, setMetrics] = useState(null);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dashRes, recipesRes] = await Promise.all([
          fetchDashboard(token),
          listRecipes(token, { status: 'approved' }),
        ]);
        setMetrics(dashRes);
        const mappedRecipes = (recipesRes.items || []).map((r) => ({
          id: r._id || r.id,
          title: r.title,
          cuisine: r.cuisine,
          dietary: r.dietary || [],
          reviews: r.reviews || [],
          createdAt: r.createdAt,
        }));
        setAllRecipes(mappedRecipes);
        setRecentRecipes(mappedRecipes.slice(-5));
        setError(null);
      } catch (err) {
        console.error('Dashboard load failed', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const stats = useMemo(() => {
    if (!metrics) {
      return null;
    }
    const rangeMeta = rangeOptions.find((range) => range.value === selectedRange) ?? rangeOptions[1];
    const totalRecipes = metrics.recipes?.total || 0;
    const totalReviews = metrics.reviews?.total || 0;
    const publishedRecipes = metrics.recipes?.approved || 0;
    const pendingRecipes = metrics.recipes?.pending || 0;
    const totalUsers = metrics.users?.total || 0;
    const chefCount = metrics.users?.chefs || 0;
    const flaggedCount = metrics.flags?.open || 0;
    const uniqueCuisines = metrics.taxonomy?.cuisineTop?.length || 0;
    const uniqueDietary = metrics.taxonomy?.dietaryTop?.length || 0;

    const cuisineCounts = new Map();
    allRecipes.forEach((r) => {
      if (r.cuisine) {
        cuisineCounts.set(r.cuisine, (cuisineCounts.get(r.cuisine) || 0) + 1);
      }
    });
    const topCuisines = cuisineCounts.size
      ? Array.from(cuisineCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
      : (metrics.taxonomy?.cuisineTop || []).map((entry) => [entry._id, entry.count]);

    const mostDiscussed = [...allRecipes]
      .map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        reviews: recipe.reviews?.length || 0,
        cuisine: recipe.cuisine,
      }))
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 5);

    return {
      totalRecipes,
      totalReviews,
      uniqueCuisines,
      uniqueDietary,
      totalUsers,
      chefCount,
      newSignups: null,
      flaggedCount,
      publishedRecipes,
      pendingRecipes,
      topCuisines,
      mostDiscussed,
      rangeLabel: rangeMeta.label,
    };
  }, [metrics, selectedRange, allRecipes]);

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading dashboard...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return null;
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor platform health, recent activity, and high-performing cuisines.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Showing trends for
        </Typography>
        <Select
          value={selectedRange}
          onChange={(event) => setSelectedRange(event.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          {rangeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Recipes" value={stats.totalRecipes} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Reviews" value={stats.totalReviews} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Published Recipes" value={stats.publishedRecipes} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Pending Approval" value={stats.pendingRecipes} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Registered Users" value={stats.totalUsers} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Active Chefs" value={stats.chefCount} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label={`Sign-ups ${stats.rangeLabel}`} value={stats.newSignups ?? '—'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Open Flags" value={stats.flaggedCount} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Top Cuisines
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {stats.topCuisines.map(([name, count]) => (
            <Chip key={name} label={`${name} · ${count}`} sx={{ mr: 1, mb: 1 }} />
          ))}
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Recently added recipes
        </Typography>
        <List dense>
          {recentRecipes.map((r) => (
            <ListItem key={r.id} disableGutters>
              <ListItemText
                primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 600 } }}
                primary={r.title}
                secondary={`${r.cuisine || '—'} • ${(r.dietary || []).join(', ')}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Most discussed recipes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Based on the number of public reviews.
          </Typography>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Recipe</TableCell>
              <TableCell>Cuisine</TableCell>
              <TableCell align="right">Reviews</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.mostDiscussed.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>{recipe.title}</TableCell>
                <TableCell>{recipe.cuisine}</TableCell>
                <TableCell align="right">{recipe.reviews}</TableCell>
              </TableRow>
            ))}
            {!stats.mostDiscussed.length && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2" color="text.secondary">
                    No review activity yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default AdminDashboardPage;
