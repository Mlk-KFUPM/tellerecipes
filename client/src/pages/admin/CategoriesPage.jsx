import { useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/admin.js';

const TYPES = [
  { label: 'Categories', value: 'category', helper: 'General groupings surfaced across the site.' },
  { label: 'Cuisines', value: 'cuisine', helper: 'Used in filters and discovery modules.' },
  { label: 'Dietary Tags', value: 'dietary', helper: 'Appears on recipe cards and filters.' },
];

const CategoriesPage = () => {
  const { token } = useAuth();
  const [type, setType] = useState('category');
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [editing, setEditing] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await listCategories(token, type ? { type } : undefined);
        const items = (res.items || res || []).map((c) => ({ ...c, id: c._id || c.id }));
        setCategories(items);
      } catch (err) {
        console.error('Load categories failed', err);
        setFeedback({ severity: 'error', message: err.message || 'Failed to load categories' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, type]);

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories
      .filter((category) => (term ? category.label.toLowerCase().includes(term) : true))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categories, search]);

  const isDuplicate = (label, ignoreId = null) =>
    categories.some(
      (category) => category.type === type && category.label.toLowerCase() === label.trim().toLowerCase() && category.id !== ignoreId,
    );

  const handleAdd = async () => {
    if (!newLabel.trim() || isDuplicate(newLabel)) {
      setFeedback({ severity: 'error', message: 'Enter a unique name before adding.' });
      return;
    }
    try {
      const created = await createCategory(token, { label: newLabel.trim(), type });
      const mapped = { ...created, id: created._id || created.id };
      setCategories((prev) => [...prev, mapped]);
      setFeedback({ severity: 'success', message: `${TYPES.find((t) => t.value === type)?.label ?? 'Entry'} added.` });
      setNewLabel('');
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'Failed to add category' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editing?.value.trim()) {
      setFeedback({ severity: 'error', message: 'Label cannot be empty.' });
      return;
    }
    if (isDuplicate(editing.value, editing.id)) {
      setFeedback({ severity: 'error', message: 'Name must be unique.' });
      return;
    }
    try {
      const updated = await updateCategory(token, editing.id, { label: editing.value.trim() });
      const mapped = { ...updated, id: updated._id || updated.id };
      setCategories((prev) => prev.map((cat) => (cat.id === mapped.id ? mapped : cat)));
      setFeedback({ severity: 'success', message: 'Label updated.' });
      setEditing(null);
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'Failed to update category' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(token, id, false);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setFeedback({ severity: 'info', message: 'Entry removed.' });
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'Failed to delete entry' });
    }
  };

  const helperText = TYPES.find((item) => item.value === type)?.helper;

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Configure categories & filters
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Curate the lists chefs can assign to recipes and the filters surfaced to diners.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <ToggleButtonGroup
                value={type}
                exclusive
                onChange={(_, value) => value && setType(value)}
                size="small"
                color="primary"
              >
                {TYPES.map((item) => (
                  <ToggleButton key={item.value} value={item.value}>
                    {item.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Typography variant="body2" color="text.secondary">
                {helperText}
              </Typography>
              <TextField
                label="Search entries"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Type to filter list"
              />
              <TextField
                label={`Add new ${TYPES.find((item) => item.value === type)?.label.toLowerCase()}`}
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
                placeholder="e.g., High Protein"
              />
              <Button variant="contained" onClick={handleAdd} disabled={!newLabel.trim()}>
                Add entry
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {loading ? 'Loading entries...' : `${items.length} entries`}
              </Typography>
              <List dense>
                {items.map((item) => (
                  <ListItem key={item.id} divider>
                    {editing?.id === item.id ? (
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                        <TextField
                          value={editing.value}
                          onChange={(event) => setEditing({ ...editing, value: event.target.value })}
                          size="small"
                          fullWidth
                        />
                        <Button size="small" variant="contained" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button size="small" onClick={() => setEditing(null)}>
                          Cancel
                        </Button>
                      </Stack>
                    ) : (
                      <>
                        <ListItemText primary={item.label} />
                        <ListItemSecondaryAction>
                          <Tooltip title="Rename">
                            <IconButton size="small" onClick={() => setEditing({ id: item.id, value: item.label })}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <span>
                              <IconButton size="small" onClick={() => handleDelete(item.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </>
                    )}
                  </ListItem>
                ))}
                {!items.length && (
                  <Typography variant="body2" color="text.secondary">
                    Nothing to show yet. Add your first entry on the left.
                  </Typography>
                )}
              </List>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback && (
          <Alert severity={feedback.severity} variant="filled" sx={{ width: '100%' }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}
      </Snackbar>
    </Stack>
  );
};

export default CategoriesPage;
