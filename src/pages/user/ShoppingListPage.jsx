import { useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ShoppingListSummary from '../../components/shopping/ShoppingListSummary.jsx';
import { useAppDispatch, useAppState, selectShoppingListDetails } from '../../context/AppStateContext.jsx';

const ShoppingListPage = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const shoppingData = useMemo(() => selectShoppingListDetails(state), [state]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const handleGenerate = () => {
    if (!shoppingData.recipes.length) {
      return;
    }
    setIsGenerated(true);
    setFeedback({ open: true, message: 'Shopping list generated', severity: 'success' });
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_SHOPPING_LIST' });
    setIsGenerated(false);
    setFeedback({ open: true, message: 'Shopping list cleared', severity: 'info' });
  };

  const handleRemoveRecipe = (recipeId) => {
    dispatch({ type: 'REMOVE_RECIPE_FROM_SHOPPING_LIST', payload: { recipeId } });
    setFeedback({ open: true, message: 'Recipe removed from shopping list', severity: 'info' });
  };

  const handleExport = async () => {
    if (!isGenerated) {
      return;
    }
    const text = shoppingData.consolidated
      .map((item) => `• ${item.name} — ${item.quantity} ${item.unit}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ open: true, message: 'Shopping list copied to clipboard', severity: 'success' });
    } catch (error) {
      setFeedback({ open: true, message: 'Unable to copy list. Try manual copy.', severity: 'error' });
    }
  };

  const handlePrint = () => {
    if (isGenerated) {
      window.print();
    }
  };

  return (
    <>
      <ShoppingListSummary
        recipes={shoppingData.recipes}
        consolidatedItems={shoppingData.consolidated}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onRemoveRecipe={handleRemoveRecipe}
        onExport={handleExport}
        onPrint={handlePrint}
        isGenerated={isGenerated}
      />
      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback.severity} variant="filled" sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShoppingListPage;
