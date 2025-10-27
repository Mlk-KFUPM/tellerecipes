import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

const CollectionCard = ({ collection, recipes, onViewRecipe }) => (
  <Card elevation={0} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {collection.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {collection.recipeIds.length} saved recipe{collection.recipeIds.length === 1 ? '' : 's'}
          </Typography>
        </Stack>
        <Stack spacing={1.5}>
          {recipes.map((recipe) => (
            <Stack key={recipe.id} direction="row" spacing={1} alignItems="center">
              <Chip label={recipe.cuisine} size="small" color="primary" variant="outlined" />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {recipe.title}
              </Typography>
              <Button size="small" onClick={() => onViewRecipe(recipe.id)}>
                View
              </Button>
            </Stack>
          ))}
          {!recipes.length && (
            <Typography variant="body2" color="text.secondary">
              Start saving recipes from the browse page to populate this collection.
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

CollectionCard.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    recipeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  recipes: PropTypes.arrayOf(PropTypes.object),
  onViewRecipe: PropTypes.func.isRequired,
};

CollectionCard.defaultProps = {
  recipes: [],
};

export default CollectionCard;
