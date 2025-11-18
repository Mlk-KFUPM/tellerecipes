import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import RecipeGrid from '../../components/recipes/RecipeGrid.jsx';
import { useAppState, selectFilters } from '../../context/AppStateContext.jsx';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const state = useAppState();
  const { recipeSummaries } = state;
  const { cuisines, dietary } = selectFilters(state);

  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('cuisine'); // 'cuisine' | 'dietary'
  const [selected, setSelected] = useState(null);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    if (mode === 'cuisine') {
      recipeSummaries.forEach((r) => counts.set(r.cuisine, (counts.get(r.cuisine) ?? 0) + 1));
    } else {
      recipeSummaries.forEach((r) => r.dietary.forEach((d) => counts.set(d, (counts.get(d) ?? 0) + 1)));
    }
    return counts;
  }, [recipeSummaries, mode]);

  const categories = useMemo(() => {
    const list = mode === 'cuisine' ? cuisines : dietary;
    const term = search.trim().toLowerCase();
    return list
      .filter((c) => (term ? c.toLowerCase().includes(term) : true))
      .map((c) => ({ name: c, count: categoryCounts.get(c) ?? 0 }));
  }, [cuisines, dietary, mode, search, categoryCounts]);

  const filteredRecipes = useMemo(() => {
    if (!selected) return [];
    if (mode === 'cuisine') {
      return recipeSummaries.filter((r) => r.cuisine === selected);
    }
    return recipeSummaries.filter((r) => r.dietary.includes(selected));
  }, [recipeSummaries, selected, mode]);

  const handleOpenRecipe = (recipe) => {
    // Reuse existing user recipe detail page to view
    navigate(`/app/user/recipes/${recipe.id}`);
  };

  const noop = () => {};

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Categories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse by cuisine or dietary tag. Select a category to view matching recipes.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <ToggleButtonGroup
                color="primary"
                value={mode}
                exclusive
                onChange={(_, val) => val && setMode(val)}
                size="small"
              >
                <ToggleButton value="cuisine">Cuisines</ToggleButton>
                <ToggleButton value="dietary">Dietary</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                label="Search categories"
                placeholder="Type to filter"
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {categories.map((c) => (
                  <Chip
                    key={c.name}
                    label={`${c.name} · ${c.count}`}
                    color={selected === c.name ? 'primary' : 'default'}
                    onClick={() => setSelected(c.name)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
                {!categories.length && (
                  <Typography variant="body2" color="text.secondary">
                    No categories match your search.
                  </Typography>
                )}
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => setSelected(null)} disabled={!selected}>
                  Clear selection
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selected ? `Recipes in: ${selected}` : 'Choose a category to view recipes'}
            </Typography>
            {selected && (
              <RecipeGrid
                recipes={filteredRecipes}
                onOpenRecipe={handleOpenRecipe}
                onSaveRecipe={noop}
                onAddToList={noop}
              />
            )}
            {!selected && (
              <Typography variant="body2" color="text.secondary">
                Select a category from the left to see matching recipes.
              </Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default CategoriesPage;

