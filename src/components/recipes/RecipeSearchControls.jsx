import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TuneIcon from '@mui/icons-material/Tune';

const RecipeSearchControls = ({
  searchTerm,
  onSearchChange,
  cuisineOptions,
  dietaryOptions,
  selectedCuisine,
  selectedDietary,
  onCuisineChange,
  onDietaryChange,
  onReset,
}) => (
  <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }}>
    <TextField
      value={searchTerm}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder="Search by recipe or ingredient"
      fullWidth
    />
    <Autocomplete
      value={selectedCuisine}
      onChange={(_, value) => onCuisineChange(value)}
      options={cuisineOptions}
      sx={{ minWidth: 200 }}
      renderInput={(params) => <TextField {...params} label="Cuisine" />}
      clearOnBlur
    />
    <Autocomplete
      multiple
      value={selectedDietary}
      onChange={(_, value) => onDietaryChange(value)}
      options={dietaryOptions}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => <Chip {...getTagProps({ index })} key={option} label={option} />)
      }
      renderInput={(params) => <TextField {...params} label="Dietary" />}
      sx={{ minWidth: 240 }}
    />
    <Button variant="outlined" onClick={onReset} startIcon={<TuneIcon />}>
      Reset filters
    </Button>
  </Stack>
);

RecipeSearchControls.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  cuisineOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  dietaryOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedCuisine: PropTypes.string,
  selectedDietary: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCuisineChange: PropTypes.func.isRequired,
  onDietaryChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

RecipeSearchControls.defaultProps = {
  selectedCuisine: null,
};

export default RecipeSearchControls;
