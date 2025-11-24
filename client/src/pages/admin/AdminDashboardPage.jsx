import { useMemo, useState } from 'react';
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
import { useAppState, selectFilters } from '../../context/AppStateContext.jsx';

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
  const state = useAppState();
  const { cuisines, dietary } = selectFilters(state);
  const [selectedRange, setSelectedRange] = useState('30d');

  const stats = useMemo(() => {
    const { admin, recipes } = state;
    const rangeMeta = rangeOptions.find((range) => range.value === selectedRange) ?? rangeOptions[1];
    const now = Date.now();
    const threshold = now - rangeMeta.days * 24 * 60 * 60 * 1000;
    const totalRecipes = recipes.length;
    const totalReviews = recipes.reduce((sum, r) => sum + r.reviews.length, 0);
    const publishedRecipes = recipes.filter((r) => r.status === 'approved').length;
    const pendingRecipes = totalRecipes - publishedRecipes;
    const totalUsers = admin.users.length;
    const chefCount = admin.users.filter((user) => user.role === 'Chef').length;
    const newSignups = admin.users.filter((user) => new Date(user.joinedAt).getTime() >= threshold).length;
    const flaggedCount = admin.flaggedContent.length;
    const uniqueCuisines = cuisines.length;
    const uniqueDietary = dietary.length;

    // Top cuisines by count
    const cuisineCounts = new Map();
    recipes.forEach((r) => {
      cuisineCounts.set(r.cuisine, (cuisineCounts.get(r.cuisine) ?? 0) + 1);
    });
    const topCuisines = Array.from(cuisineCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const mostDiscussed = [...recipes]
      .map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        reviews: recipe.reviews.length,
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
      newSignups,
      flaggedCount,
      publishedRecipes,
      pendingRecipes,
      topCuisines,
      mostDiscussed,
      rangeLabel: rangeMeta.label,
    };
  }, [state, cuisines.length, dietary.length, selectedRange]);

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
          <StatCard label={`Sign-ups ${stats.rangeLabel}`} value={stats.newSignups} />
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
          {state.recipes.slice(-5).map((r) => (
            <ListItem key={r.id} disableGutters>
              <ListItemText
                primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 600 } }}
                primary={r.title}
                secondary={`${r.cuisine} • ${r.dietary.join(', ')}`}
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
