import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import { useAuth } from '../../context/AuthContext.jsx';

const makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

dayjs.extend(relativeTime);

const statusColorMap = {
  approved: 'success',
  pending: 'warning',
  draft: 'default',
  rejected: 'error',
};

const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  cuisine: z.string().min(1, 'Cuisine helps users discover your recipe'),
  categories: z.string().min(1, 'Add at least one category'),
  dietary: z.string().optional(),
  prepTime: z.coerce.number().min(0, 'Prep time cannot be negative'),
  cookTime: z.coerce.number().min(0, 'Cook time cannot be negative'),
  servings: z.coerce.number().min(1, 'Servings must be at least 1'),
  image: z.string().url('Provide a valid image URL'),
  gallery: z.string().optional(),
  ingredients: z
    .array(
      z.object({
        originalId: z.string(),
        name: z.string().min(1, 'Ingredient name is required'),
        quantity: z.string().min(1, 'Quantity is required'),
        unit: z.string().optional(),
        alternatives: z.string().optional(),
      }),
    )
    .min(1, 'Add at least one ingredient'),
  steps: z
    .array(
      z.object({
        description: z.string().min(1, 'Step description cannot be empty'),
      }),
    )
    .min(1, 'Include at least one instruction step'),
  changeType: z.enum(['minor', 'major']).optional(),
});

const createEmptyIngredient = () => ({
  originalId: makeId('ing'),
  name: '',
  quantity: '',
  unit: '',
  alternatives: '',
});

const createEmptyStep = () => ({
  description: '',
});

const normalizeList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeMultilineList = (value) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const toNumberOrZero = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toFormShape = (recipe) =>
  recipe
    ? {
        title: recipe.title,
        description: recipe.description,
        cuisine: recipe.cuisine || '',
        categories: (recipe.categories || []).join(', '),
        dietary: (recipe.dietary || []).join(', '),
        prepTime: recipe.prepTime ?? 0,
        cookTime: recipe.cookTime ?? 0,
        servings: recipe.servings ?? 1,
        image: recipe.image || '',
        gallery: (recipe.gallery || []).join('\n'),
        ingredients: (recipe.ingredients || []).map((ingredient) => ({
          originalId: ingredient.id || makeId('ing'),
          name: ingredient.name || '',
          quantity: ingredient.quantity?.toString() ?? '',
          unit: ingredient.unit || '',
          alternatives: (ingredient.alternatives || []).join(', '),
        })),
        steps: (recipe.steps || []).map((step) => ({
          description: step,
        })),
        changeType: 'minor',
      }
    : {
        title: '',
        description: '',
        cuisine: '',
        categories: '',
        dietary: '',
        prepTime: 0,
        cookTime: 0,
        servings: 1,
        image: '',
        gallery: '',
        ingredients: [createEmptyIngredient()],
        steps: [createEmptyStep()],
        changeType: 'minor',
      };

const ChefRecipeManager = ({ recipes, profileStatus, onCreate, onUpdate, onDelete }) => {
  useAuth(); // ensure auth context mounted for cookie-based calls
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const defaultValues = useMemo(() => toFormShape(editingRecipe), [editingRecipe]);

  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues,
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: 'steps',
  });

  const heroImage = useWatch({ control, name: 'image' });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    setImageError(false);
  }, [heroImage, dialogOpen]);

  const handleClose = () => {
    setDialogOpen(false);
    setEditingRecipe(null);
  };

  const handleCreate = () => {
    setMode('create');
    setEditingRecipe(null);
    reset(toFormShape(null));
    setDialogOpen(true);
  };

  const handleEdit = (recipe) => {
    setMode('edit');
    setEditingRecipe(recipe);
    reset(toFormShape(recipe));
    setDialogOpen(true);
  };

  const onSubmit = handleSubmit((values) => {
    const normalized = {
      title: values.title,
      description: values.description,
      cuisine: values.cuisine,
      categories: normalizeList(values.categories),
      dietary: normalizeList(values.dietary || ''),
      prepTime: values.prepTime,
      cookTime: values.cookTime,
      servings: values.servings,
      image: values.image,
      gallery: normalizeMultilineList(values.gallery || ''),
      ingredients: values.ingredients.map((ingredient) => ({
        id: ingredient.originalId || makeId('ing'),
        name: ingredient.name,
        quantity: toNumberOrZero(ingredient.quantity),
        unit: ingredient.unit || '',
        alternatives: normalizeList(ingredient.alternatives || ''),
      })),
      steps: values.steps.map((step) => step.description.trim()).filter(Boolean),
    };

    if (mode === 'create') {
      onCreate(normalized);
      setFeedback({ variant: 'success', message: 'Your recipe has been submitted for review!' });
    } else if (editingRecipe) {
      onUpdate(editingRecipe.id, normalized);
      setFeedback({
        variant: values.changeType === 'major' ? 'warning' : 'success',
        message:
          values.changeType === 'major'
            ? 'Recipe updated. We will take another look before republishing.'
            : 'Recipe updated successfully.',
      });
    }

    handleClose();
  });

  const canPublish = profileStatus === 'approved';

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              My recipes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Draft, submit, and maintain your TellerRecipes portfolio. Major edits to live recipes will trigger a quick re-review.
            </Typography>
          </Stack>
          <Button variant="contained" onClick={handleCreate} disabled={!canPublish}>
            Create new recipe
          </Button>
        </Stack>

        {!canPublish && (
          <Alert severity="info">
            Your application is being reviewed. Publishing will unlock once your chef profile is approved.
          </Alert>
        )}

        {feedback && (
          <Alert severity={feedback.variant} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}

        <Divider />

        {recipes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No recipes yet. Once approved, start sharing your signature dishes with the community.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {recipes.map((recipe) => (
              <Grid item xs={12} md={6} key={recipe.id}>
                <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={recipe.image || 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=1200&q=80'}
                    alt={recipe.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {recipe.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {recipe.description}
                        </Typography>
                      </Stack>
                      <Chip
                        label={recipe.status ? recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1) : 'Draft'}
                        color={statusColorMap[recipe.status] || 'default'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {recipe.categories?.map((category) => (
                        <Chip key={category} label={category} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      Updated {dayjs(recipe.updatedAt || recipe.createdAt).fromNow()}
                    </Typography>
                    <Button size="small" variant="text" onClick={() => handleEdit(recipe)}>
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{mode === 'create' ? 'Create a new recipe' : `Edit ${editingRecipe?.title}`}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="Recipe title" {...register('title')} error={Boolean(errors.title)} helperText={errors.title?.message} />
          <TextField
            label="Description"
            multiline
            minRows={3}
            {...register('description')}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <TextField label="Cuisine" {...register('cuisine')} error={Boolean(errors.cuisine)} helperText={errors.cuisine?.message} />
            <TextField
              label="Prep time (minutes)"
              type="number"
              inputProps={{ min: 0 }}
              {...register('prepTime')}
              error={Boolean(errors.prepTime)}
              helperText={errors.prepTime?.message}
            />
            <TextField
              label="Cook time (minutes)"
              type="number"
              inputProps={{ min: 0 }}
              {...register('cookTime')}
              error={Boolean(errors.cookTime)}
              helperText={errors.cookTime?.message}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <TextField
              label="Servings"
              type="number"
              inputProps={{ min: 1 }}
              {...register('servings')}
              error={Boolean(errors.servings)}
              helperText={errors.servings?.message}
            />
            <TextField
              label="Categories (comma separated)"
              helperText={errors.categories?.message || 'E.g., Dinner, Weeknight, Vegetarian'}
              {...register('categories')}
              error={Boolean(errors.categories)}
            />
            <TextField
              label="Dietary tags (comma separated)"
              helperText={errors.dietary?.message || 'Optional'}
              {...register('dietary')}
              error={Boolean(errors.dietary)}
            />
          </Box>

          <TextField
            label="Hero image URL"
            helperText={errors.image?.message || 'Use a high-quality landscape image (JPG or PNG)'}
            {...register('image')}
            error={Boolean(errors.image)}
          />

          {heroImage?.trim() ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Preview
              </Typography>
              <Box
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: imageError ? 'error.light' : 'divider',
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  position: 'relative',
                  pt: '56.25%',
                }}
              >
                {!imageError ? (
                  <Box
                    component="img"
                    src={heroImage}
                    alt="Recipe hero preview"
                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ position: 'absolute', inset: 0, p: 2, bgcolor: 'background.paper' }}
                    spacing={0.5}
                  >
                    <Typography variant="subtitle2" color="error.main">
                      We couldn&apos;t load that image.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Double-check the URL or use a different JPG/PNG link.
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Stack>
          ) : null}

          <TextField
            label="Gallery image URLs"
            multiline
            minRows={2}
            helperText={errors.gallery?.message || 'Optional: provide one URL per line'}
            {...register('gallery')}
            error={Boolean(errors.gallery)}
          />

          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Ingredients
            </Typography>
            {ingredientFields.map((field, index) => (
              <Paper key={field.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Ingredient"
                      {...register(`ingredients.${index}.name`)}
                      error={Boolean(errors.ingredients?.[index]?.name)}
                      helperText={errors.ingredients?.[index]?.name?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={3}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      {...register(`ingredients.${index}.quantity`)}
                      error={Boolean(errors.ingredients?.[index]?.quantity)}
                      helperText={errors.ingredients?.[index]?.quantity?.message}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} md={2}>
                    <TextField
                      fullWidth
                      label="Unit"
                      {...register(`ingredients.${index}.unit`)}
                      error={Boolean(errors.ingredients?.[index]?.unit)}
                      helperText={errors.ingredients?.[index]?.unit?.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Alternatives"
                      helperText="Comma separated"
                      {...register(`ingredients.${index}.alternatives`)}
                      error={Boolean(errors.ingredients?.[index]?.alternatives)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} md="auto">
                    <Tooltip title="Remove ingredient">
                      <span>
                        <IconButton color="error" size="small" onClick={() => removeIngredient(index)} disabled={ingredientFields.length === 1}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>
                <input type="hidden" {...register(`ingredients.${index}.originalId`)} />
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => appendIngredient(createEmptyIngredient())}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add ingredient
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Step-by-step instructions
            </Typography>
            {stepFields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={2} alignItems="flex-start">
                <TextField
                  fullWidth
                  label={`Step ${index + 1}`}
                  multiline
                  minRows={2}
                  {...register(`steps.${index}.description`)}
                  error={Boolean(errors.steps?.[index]?.description)}
                  helperText={errors.steps?.[index]?.description?.message}
                />
                <Tooltip title="Remove step">
                  <span>
                    <IconButton color="error" size="small" onClick={() => removeStep(index)} disabled={stepFields.length === 1}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}
            <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={() => appendStep(createEmptyStep())} sx={{ alignSelf: 'flex-start' }}>
              Add instruction
            </Button>
          </Stack>

          {mode === 'edit' && (
            <TextField select label="What kind of update is this?" {...register('changeType')} error={Boolean(errors.changeType)} helperText={errors.changeType?.message}>
              <MenuItem value="minor">Minor tweak (no re-approval needed)</MenuItem>
              <MenuItem value="major">Major update (triggers admin review)</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={onSubmit} variant="contained" disabled={isSubmitting}>
            {mode === 'create' ? 'Submit for review' : 'Save updates'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

ChefRecipeManager.propTypes = {
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      categories: PropTypes.arrayOf(PropTypes.string),
      status: PropTypes.string,
      updatedAt: PropTypes.string,
      createdAt: PropTypes.string,
    }),
  ),
  profileStatus: PropTypes.string,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};

ChefRecipeManager.defaultProps = {
  recipes: [],
  profileStatus: 'pending',
  onCreate: () => {},
  onUpdate: () => {},
  onDelete: () => {},
};

export default ChefRecipeManager;
