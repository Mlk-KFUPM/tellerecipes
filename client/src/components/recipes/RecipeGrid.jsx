import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import RecipeCard from './RecipeCard.jsx';

const RecipeGrid = ({ recipes, onOpenRecipe, onSaveRecipe, onAddToList, loading }) => {
  if (loading) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
        Loading recipes...
      </Typography>
    );
  }

  if (!recipes.length) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
        No recipes found for your current filters. Try adjusting your search or dietary preferences.
      </Typography>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {recipes.map((recipe) => (
        <Grid item xs={12} sm={6} md={4} key={recipe.id}>
          <RecipeCard recipe={recipe} onOpen={onOpenRecipe} onSave={onSaveRecipe} onAddToList={onAddToList} />
        </Grid>
      ))}
    </Grid>
  );
};

RecipeGrid.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
  onOpenRecipe: PropTypes.func.isRequired,
  onSaveRecipe: PropTypes.func.isRequired,
  onAddToList: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

RecipeGrid.defaultProps = {
  loading: false,
};

export default RecipeGrid;
