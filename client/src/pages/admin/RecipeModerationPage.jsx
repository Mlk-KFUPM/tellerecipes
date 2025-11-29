import { useMemo, useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext.jsx";
import { listRecipes, updateRecipeStatus, deleteRecipe } from "../../api/admin.js";

const RecipeModerationPage = () => {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [searchPending, setSearchPending] = useState("");
  const [searchPublished, setSearchPublished] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [removeCandidate, setRemoveCandidate] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await listRecipes(token);
        const mapped = (res.items || res || []).map((r) => ({
          ...r,
          id: r._id || r.id,
          dietary: r.dietary || [],
          ingredients: r.ingredients || [],
          steps: r.steps || [],
        }));
        setRecipes(mapped);
      } catch (err) {
        console.error("Failed to load recipes", err);
        setFeedback({ severity: "error", message: err.message || "Failed to load recipes" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const pendingSubmissions = useMemo(
    () =>
      recipes
        .filter((recipe) => recipe.status && recipe.status !== "approved")
        .filter((recipe) =>
          searchPending.trim()
            ? recipe.title
                .toLowerCase()
                .includes(searchPending.trim().toLowerCase())
            : true
        ),
    [recipes, searchPending]
  );

  const approvedRecipes = useMemo(
    () =>
      recipes
        .filter((recipe) => recipe.status === "approved")
        .filter((recipe) =>
          searchPublished.trim()
            ? recipe.title
                .toLowerCase()
                .includes(searchPublished.trim().toLowerCase())
            : true
        ),
    [recipes, searchPublished]
  );

  const handleApprove = async (id) => {
    try {
      const updated = await updateRecipeStatus(token, id, { status: "approved" });
      setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated, id: updated._id || updated.id } : r)));
      setFeedback({
        severity: "success",
        message: "Recipe approved and published.",
      });
    } catch (err) {
      setFeedback({ severity: "error", message: err.message || "Failed to approve recipe" });
    }
  };

  const handleReject = async (id) => {
    const note = decisionNotes[id]?.trim();
    try {
      const updated = await updateRecipeStatus(token, id, { status: "rejected", note });
      setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated, id: updated._id || updated.id } : r)));
      setFeedback({
        severity: "warning",
        message: "Recipe rejected and sent back to chef.",
      });
    } catch (err) {
      setFeedback({ severity: "error", message: err.message || "Failed to reject recipe" });
    }
  };

  const handleRemoveRecipe = async () => {
    if (!removeCandidate) return;
    try {
      await deleteRecipe(token, removeCandidate.id);
      setRecipes((prev) => prev.filter((r) => r.id !== removeCandidate.id));
      setFeedback({ severity: "info", message: "Recipe removed from catalog." });
    } catch (err) {
      setFeedback({ severity: "error", message: err.message || "Failed to remove recipe" });
    } finally {
      setRemoveCandidate(null);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Recipe moderation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review pending submissions, provide feedback, and manage published
          recipes.
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pending submissions
            </Typography>
            <TextField
              value={searchPending}
              onChange={(event) => setSearchPending(event.target.value)}
              placeholder="Search by recipe title"
              size="small"
              sx={{ maxWidth: 320 }}
            />
          </Stack>
          <Grid container spacing={3}>
            {loading && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Loading submissions...
                </Typography>
              </Grid>
            )}
            {!loading && pendingSubmissions.map((recipe) => (
              <Grid key={recipe.id} item xs={12} md={6}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3, height: "100%" }}
                >
                  <Stack spacing={1.5}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {recipe.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chef ID: {recipe.chefId || "N/A"}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          size="small"
                          label={recipe.cuisine || "Unassigned"}
                        />
                        <Chip
                          size="small"
                          label={recipe.status}
                          color="warning"
                        />
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        View details
                      </Button>
                    </Stack>
                    <TextField
                      label="Feedback for chef"
                      value={decisionNotes[recipe.id] ?? ""}
                      onChange={(event) =>
                        setDecisionNotes((prev) => ({
                          ...prev,
                          [recipe.id]: event.target.value,
                        }))
                      }
                      multiline
                      minRows={2}
                      placeholder="Optional note to explain the decision"
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        onClick={() => handleApprove(recipe.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleReject(recipe.id)}
                      >
                        Reject
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            ))}
            {!loading && !pendingSubmissions.length && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  No pending submissions.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Published recipes
            </Typography>
            <TextField
              value={searchPublished}
              onChange={(event) => setSearchPublished(event.target.value)}
              placeholder="Search existing recipes"
              size="small"
              sx={{ maxWidth: 320 }}
            />
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Recipe</TableCell>
                <TableCell>Cuisine</TableCell>
                <TableCell>Chef ID</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && approvedRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>{recipe.title}</TableCell>
                  <TableCell>{recipe.cuisine || "—"}</TableCell>
                  <TableCell>{recipe.chefId || "—"}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove from catalog">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => setRemoveCandidate(recipe)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !approvedRecipes.length && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      No approved recipes found for this search.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Stack>
      </Paper>

      <Dialog
        open={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedRecipe?.title}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <Typography variant="subtitle2">
              Cuisine: {selectedRecipe?.cuisine || "Unassigned"}
            </Typography>
            <Typography variant="subtitle2">
              Dietary: {selectedRecipe?.dietary?.join(", ") || "None"}
            </Typography>
            <Typography variant="subtitle2">Description</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedRecipe?.description}
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Ingredients
            </Typography>
            <Stack component="ul" sx={{ pl: 3, color: "text.secondary" }}>
              {selectedRecipe?.ingredients?.map((ingredient) => (
                <li key={ingredient.id || ingredient.originalId}>
                  {ingredient.name}
                </li>
              ))}
            </Stack>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Steps
            </Typography>
            <Stack component="ol" sx={{ pl: 3, color: "text.secondary" }}>
              {selectedRecipe?.steps?.map((step, index) => (
                <li key={index}>{step.description || step}</li>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRecipe(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(removeCandidate)}
        onClose={() => setRemoveCandidate(null)}
      >
        <DialogTitle>Remove recipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove “{removeCandidate?.title}”? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveCandidate(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleRemoveRecipe}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {feedback && (
          <Alert
            severity={feedback.severity}
            variant="filled"
            sx={{ width: "100%" }}
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        )}
      </Snackbar>
    </Stack>
  );
};

export default RecipeModerationPage;
