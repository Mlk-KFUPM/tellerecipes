import { useEffect, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ShoppingListSummary from '../../components/shopping/ShoppingListSummary.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getShoppingList, updateShoppingList, clearShoppingList, removeFromShoppingList, getRecipe } from '../../api/user.js';

const ShoppingListPage = () => {
  const { token } = useAuth();
  const [recipeMap, setRecipeMap] = useState({});
  const [recipeIds, setRecipeIds] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const shoppingData = useMemo(() => {
    const recipes = recipeIds.map((id) => recipeMap[id]).filter(Boolean);
    const consolidatedMap = new Map();
    recipes.forEach((recipe) => {
      (recipe.ingredients || []).forEach((ingredient) => {
        const key = ingredient.name.toLowerCase();
        const existing = consolidatedMap.get(key);
        if (existing) {
          consolidatedMap.set(key, { ...existing, quantity: existing.quantity + (ingredient.quantity || 0) });
        } else {
          consolidatedMap.set(key, { ...ingredient });
        }
      });
    });
    return {
      recipes,
      consolidated: Array.from(consolidatedMap.values()),
    };
  }, [recipeIds, recipeMap]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await getShoppingList(token);
        const ids = (res.recipeIds || []).map((id) => id.toString());
        setRecipeIds(ids);
        await Promise.all(
          ids.map(async (id) => {
            if (recipeMap[id]) return;
            const data = await getRecipe(id);
            const mapped = { ...data, id: data._id || data.id, dietary: data.dietary || [], ingredients: data.ingredients || [] };
            setRecipeMap((prev) => ({ ...prev, [mapped.id]: mapped }));
          }),
        );
      } catch (err) {
        console.error('Failed to load shopping list', err);
        setFeedback({ open: true, message: err.message || 'Failed to load shopping list', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleGenerate = () => {
    if (!shoppingData.recipes.length) {
      return;
    }
    setIsGenerated(true);
    setFeedback({ open: true, message: 'Shopping list generated', severity: 'success' });
  };

  const handleClear = () => {
    clearShoppingList(token)
      .then(() => {
        setRecipeIds([]);
        setIsGenerated(false);
        setFeedback({ open: true, message: 'Shopping list cleared', severity: 'info' });
      })
      .catch((err) => setFeedback({ open: true, message: err.message || 'Failed to clear list', severity: 'error' }));
  };

  const handleRemoveRecipe = (recipeId) => {
    removeFromShoppingList(token, recipeId)
      .then((res) => {
        setRecipeIds((res.recipeIds || []).map((id) => id.toString()));
        setFeedback({ open: true, message: 'Recipe removed from shopping list', severity: 'info' });
      })
      .catch((err) => setFeedback({ open: true, message: err.message || 'Failed to update list', severity: 'error' }));
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
