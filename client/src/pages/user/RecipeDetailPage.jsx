import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RecipeDetail from "../../components/recipes/RecipeDetail.jsx";
import ReviewList from "../../components/recipes/ReviewList.jsx";
import ReviewForm from "../../components/recipes/ReviewForm.jsx";
import CollectionSelectorDialog from "../../components/collections/CollectionSelectorDialog.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  addReview,
  createCollection,
  getRecipe,
  listCollections,
  listReviews,
  toggleSaveRecipe,
  updateShoppingList,
} from "../../api/user.js";

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [collections, setCollections] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [collectionDialog, setCollectionDialog] = useState({
    open: false,
    recipe: null,
  });
  const [feedback, setFeedback] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [recipeRes, reviewRes] = await Promise.all([getRecipe(id), listReviews(id)]);
        const mappedRecipe = {
          ...recipeRes,
          id: recipeRes._id || recipeRes.id,
          dietary: recipeRes.dietary || [],
          ingredients: recipeRes.ingredients || [],
        };
        setRecipe(mappedRecipe);
        setReviews(reviewRes.items || []);
        if (token) {
          const collectionRes = await listCollections(token);
          const mappedCollections = (collectionRes.items || collectionRes || []).map((c) => ({
            ...c,
            id: c._id || c.id,
            recipeIds: (c.recipeIds || []).map((rid) => rid.toString()),
          }));
          setCollections(mappedCollections);
        }
      } catch (err) {
        console.error("Failed to load recipe", err);
        setFeedback({ open: true, message: err.message || "Failed to load recipe", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, token]);

  if (!recipe) {
    return (
      <Stack spacing={2} alignItems="flex-start">
        <Typography variant="h5">{loading ? "Loading recipe..." : "Recipe not found"}</Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Go back
        </Button>
      </Stack>
    );
  }

  const defaultSelectedCollections = collections
    .filter((collection) => collection.recipeIds.includes(recipe.id))
    .map((collection) => collection.id);

  const handleAddToShoppingList = (targetRecipe) => {
    if (!token) {
      setFeedback({
        open: true,
        message: "Please sign in to manage your shopping list",
        severity: "info",
      });
      return;
    }
    updateShoppingList(token, [targetRecipe.id])
      .then(() => {
        setFeedback({
          open: true,
          message: `${targetRecipe.title} added to your shopping list`,
          severity: "success",
        });
      })
      .catch((err) =>
        setFeedback({
          open: true,
          message: err.message || "Failed to update shopping list",
          severity: "error",
        }),
      );
  };

  const handleOpenCollections = (targetRecipe) => {
    setCollectionDialog({ open: true, recipe: targetRecipe });
  };

  const handleSaveToCollections = async ({ selectedIds, newCollection }) => {
    const recipeId = recipe.id;
    let collectionIds = selectedIds;
    if (!token) {
      setFeedback({
        open: true,
        message: "Please sign in to save recipes",
        severity: "info",
      });
      return;
    }

    if (newCollection) {
      const created = await createCollection(token, { name: newCollection });
      const mapped = {
        ...created,
        id: created._id || created.id,
        recipeIds: [],
      };
      setCollections((prev) => [...prev, mapped]);
      collectionIds = [...selectedIds, mapped.id];
    }
    const res = await toggleSaveRecipe(token, recipeId, { collectionIds });
    const updated = (res.collections || []).map((c) => ({
      ...c,
      id: c._id || c.id,
      recipeIds: (c.recipeIds || []).map((rid) => rid.toString()),
    }));
    setCollections(updated);
    setFeedback({
      open: true,
      message: `${recipe.title} saved to your collections`,
      severity: "success",
    });
    setCollectionDialog({ open: false, recipe: null });
  };

  const handleCreateCollection = async (name) => {
    if (!token) {
      setFeedback({
        open: true,
        message: "Please sign in to save recipes",
        severity: "info",
      });
      return null;
    }
    const created = await createCollection(token, { name });
    const mapped = {
      ...created,
      id: created._id || created.id,
      recipeIds: [],
    };
    setCollections((prev) => [...prev, mapped]);
    return mapped.id;
  };

  const handleSubmitReview = ({ rating, comment }) => {
    if (!token) {
      setFeedback({
        open: true,
        message: "Please sign in to leave a review",
        severity: "info",
      });
      return;
    }
    addReview(token, recipe.id, { rating, comment })
      .then((res) => {
        setReviews((prev) => [...prev, res]);
        setFeedback({
          open: true,
          message: "Thank you for reviewing this recipe!",
          severity: "success",
        });
      })
      .catch((err) =>
        setFeedback({
          open: true,
          message: err.message || "Failed to submit review",
          severity: "error",
        }),
      );
  };

  return (
    <Stack spacing={6}>
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to recipes
      </Button>

      <RecipeDetail recipe={recipe} onSave={handleOpenCollections} onAddToList={handleAddToShoppingList} />

      <Stack spacing={4}>
        <Typography variant="h5">Community reviews</Typography>
        <ReviewList reviews={reviews} />
        <ReviewForm onSubmit={handleSubmitReview} />
      </Stack>

      <CollectionSelectorDialog
        open={collectionDialog.open}
        onClose={() => setCollectionDialog({ open: false, recipe: null })}
        collections={collections}
        defaultSelected={defaultSelectedCollections}
        onSave={handleSaveToCollections}
        onCreateCollection={handleCreateCollection}
      />

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={feedback.severity} variant="filled" sx={{ width: "100%" }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default RecipeDetailPage;
