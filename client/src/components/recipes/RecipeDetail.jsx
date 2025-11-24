import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const RecipeDetail = ({ recipe, onSave, onAddToList }) => (
  <Stack spacing={4}>
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Card elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardMedia component="img" height="360" image={recipe.image} alt={recipe.title} sx={{ objectFit: 'cover' }} />
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <Stack spacing={1}>
            <Typography variant="overline" color="primary.main">
              {recipe.cuisine}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {recipe.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {recipe.description}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Rating value={recipe.rating.average} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary">
              {recipe.rating.count} review{recipe.rating.count === 1 ? '' : 's'}
            </Typography>
            <Chip label={`${recipe.cookTime} mins`} />
            <Chip label={`Serves ${recipe.servings}`} variant="outlined" />
          </Stack>

          <Stack spacing={1} direction="row" flexWrap="wrap" useFlexGap>
            {recipe.dietary.map((tag) => (
              <Chip key={tag} label={tag} size="small" color="success" variant="outlined" />
            ))}
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => onAddToList(recipe)}>
              Add to shopping list
            </Button>
            <Button variant="outlined" startIcon={<CheckCircleOutlinedIcon />} onClick={() => onSave(recipe)}>
              Save to collection
            </Button>
          </Stack>
        </Stack>
      </Grid>
    </Grid>

    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Card elevation={0} sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Ingredients</Typography>
              {recipe.ingredients.map((ingredient) => (
                <Stack direction="row" spacing={1} key={ingredient.id} alignItems="center">
                  <Chip label={`${ingredient.quantity} ${ingredient.unit}`} variant="outlined" size="small" />
                  <Typography variant="body2">{ingredient.name}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card elevation={0} sx={{ borderRadius: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Method</Typography>
              {recipe.steps.map((step, index) => (
                <Stack key={step} spacing={0.5}>
                  <Typography variant="subtitle2">Step {index + 1}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step}
                  </Typography>
                  {index < recipe.steps.length - 1 && <Divider />}
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Stack>
);

RecipeDetail.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    rating: PropTypes.shape({
      average: PropTypes.number.isRequired,
      count: PropTypes.number.isRequired,
    }).isRequired,
    cookTime: PropTypes.number.isRequired,
    servings: PropTypes.number.isRequired,
    cuisine: PropTypes.string.isRequired,
    dietary: PropTypes.arrayOf(PropTypes.string).isRequired,
    ingredients: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
      }),
    ).isRequired,
    steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onAddToList: PropTypes.func.isRequired,
};

export default RecipeDetail;
