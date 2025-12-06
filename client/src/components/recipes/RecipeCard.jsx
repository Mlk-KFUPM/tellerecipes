import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const RecipeCard = ({ recipe, onOpen, onSave, onAddToList }) => {
  const rating = recipe.ratingSummary || recipe.rating || { average: 0, count: 0 };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        height="180"
        image={recipe.image}
        alt={recipe.title}
        sx={{ objectFit: "cover" }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {recipe.title}
            </Typography>
            <Chip
              label={`${Number(rating.average).toFixed(1)} ★`}
              size="small"
              color="primary"
            />
          </Stack>
        <Typography variant="body2" color="text.secondary" noWrap>
          {recipe.description}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeIcon fontSize="small" color="primary" />
          <Typography variant="caption">{recipe.cookTime} mins</Typography>
          <LocalDiningIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
          <Typography variant="caption">Serves {recipe.servings}</Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip label={recipe.cuisine} size="small" />
          {recipe.dietary.slice(0, 2).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      </Stack>
    </CardContent>
    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" onClick={() => onSave(recipe)}>
          Save
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => onAddToList(recipe)}
        >
          Add to list
        </Button>
      </Stack>
      <Button
        size="small"
        onClick={() => onOpen(recipe)}
        endIcon={<VisibilityOutlinedIcon fontSize="small" />}
      >
        View
      </Button>
    </CardActions>
  </Card>
);

};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    rating: PropTypes.shape({
      average: PropTypes.number,
      count: PropTypes.number,
    }),
    ratingSummary: PropTypes.shape({
      average: PropTypes.number,
      count: PropTypes.number,
    }),
    cookTime: PropTypes.number.isRequired,
    servings: PropTypes.number.isRequired,
    cuisine: PropTypes.string.isRequired,
    dietary: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onOpen: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onAddToList: PropTypes.func.isRequired,
};

export default RecipeCard;
