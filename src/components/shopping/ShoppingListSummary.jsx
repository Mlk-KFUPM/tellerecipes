import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const ShoppingListSummary = ({
  recipes,
  consolidatedItems,
  onGenerate,
  onClear,
  onRemoveRecipe,
  onExport,
  onPrint,
  isGenerated,
}) => (
  <Stack spacing={4}>
    <Stack spacing={1}>
      <Typography variant="h4">My Shopping List</Typography>
      <Typography variant="body1" color="text.secondary">
        Generate a consolidated ingredient list for the recipes you plan to cook.
      </Typography>
    </Stack>

    <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Recipe</TableCell>
            <TableCell align="right">Servings</TableCell>
            <TableCell align="right">Remove</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {recipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {recipe.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recipe.cuisine} · {recipe.cookTime} mins
                </Typography>
              </TableCell>
              <TableCell align="right">{recipe.servings}</TableCell>
              <TableCell align="right">
                <Button variant="text" color="error" onClick={() => onRemoveRecipe(recipe.id)}>
                  Remove
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!recipes.length && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography variant="body2" color="text.secondary">
                  No recipes selected yet. Add recipes to your shopping list from the browse page.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Paper>

    <Divider />

    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Consolidated ingredients</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={onClear} disabled={!recipes.length}>
            Clear list
          </Button>
          <Button variant="contained" onClick={onGenerate} disabled={!recipes.length}>
            Generate consolidated list
          </Button>
          <Button variant="outlined" onClick={onExport} disabled={!isGenerated}>
            Export
          </Button>
          <Button variant="outlined" onClick={onPrint} disabled={!isGenerated}>
            Print
          </Button>
        </Stack>
      </Stack>
      <Paper elevation={0} sx={{ borderRadius: 2, p: 3, bgcolor: 'background.paper' }}>
        <Stack spacing={1.5}>
          {isGenerated && consolidatedItems.length ? (
            consolidatedItems.map((item) => (
              <Stack direction="row" spacing={2} key={item.id || item.name}>
                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 600 }}>
                  {item.quantity} {item.unit}
                </Typography>
                <Typography variant="body2">{item.name}</Typography>
              </Stack>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Once you generate the list, the combined ingredients will appear here ready for export or printing.
            </Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  </Stack>
);

ShoppingListSummary.propTypes = {
  recipes: PropTypes.arrayOf(PropTypes.object).isRequired,
  consolidatedItems: PropTypes.arrayOf(PropTypes.object),
  onGenerate: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onRemoveRecipe: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onPrint: PropTypes.func.isRequired,
  isGenerated: PropTypes.bool.isRequired,
};

ShoppingListSummary.defaultProps = {
  consolidatedItems: [],
};

export default ShoppingListSummary;
