import { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
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

const AdminDashboardPage = () => {
  const state = useAppState();
  const { cuisines, dietary } = selectFilters(state);

  const stats = useMemo(() => {
    const totalRecipes = state.recipes.length;
    const totalReviews = state.recipes.reduce((sum, r) => sum + r.reviews.length, 0);
    const uniqueCuisines = cuisines.length;
    const uniqueDietary = dietary.length;

    // Top cuisines by count
    const cuisineCounts = new Map();
    state.recipes.forEach((r) => {
      cuisineCounts.set(r.cuisine, (cuisineCounts.get(r.cuisine) ?? 0) + 1);
    });
    const topCuisines = Array.from(cuisineCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalRecipes, totalReviews, uniqueCuisines, uniqueDietary, topCuisines };
  }, [state, cuisines.length, dietary.length]);

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of content and platform signals. Extend with moderation queues and user management.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Recipes" value={stats.totalRecipes} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Total Reviews" value={stats.totalReviews} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Unique Cuisines" value={stats.uniqueCuisines} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Dietary Tags" value={stats.uniqueDietary} />
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
    </Stack>
  );
};

export default AdminDashboardPage;
