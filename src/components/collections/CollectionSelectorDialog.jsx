import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const CollectionSelectorDialog = ({
  open,
  onClose,
  collections,
  defaultSelected,
  onSave,
  onCreateCollection,
}) => {
  const [selectedIds, setSelectedIds] = useState(defaultSelected);
  const [newCollection, setNewCollection] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedIds(defaultSelected);
    }
  }, [open, defaultSelected]);

  const handleToggle = (collectionId) => {
    setSelectedIds((current) => (
      current.includes(collectionId)
        ? current.filter((id) => id !== collectionId)
        : [...current, collectionId]
    ));
  };

  const handleSave = () => {
    onSave({ selectedIds, newCollection: newCollection.trim() || null });
    setNewCollection('');
  };

  const handleClose = () => {
    setNewCollection('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Save to collection</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {collections.length ? (
            collections.map((collection) => (
              <FormControlLabel
                key={collection.id}
                control={
                  <Checkbox
                    checked={selectedIds.includes(collection.id)}
                    onChange={() => handleToggle(collection.id)}
                  />
                }
                label={
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">{collection.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {collection.recipeIds.length} recipe{collection.recipeIds.length === 1 ? '' : 's'}
                    </Typography>
                  </Stack>
                }
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              You have no collections yet. Create one below to keep recipes organised.
            </Typography>
          )}
          <Divider />
          <Stack spacing={1}>
            <Typography variant="subtitle2">Create new collection</Typography>
            <TextField
              value={newCollection}
              onChange={(event) => setNewCollection(event.target.value)}
              placeholder="e.g. Sunday Meal Prep"
            />
            <Button
              variant="outlined"
              onClick={async () => {
                if (!newCollection.trim()) {
                  return;
                }
                const createdId = await onCreateCollection(newCollection.trim());
                if (createdId) {
                  setSelectedIds((prev) => [...prev, createdId]);
                }
                setNewCollection('');
              }}
              disabled={!newCollection.trim()}
            >
              Add collection
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CollectionSelectorDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCreateCollection: PropTypes.func,
  collections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      recipeIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ),
  defaultSelected: PropTypes.arrayOf(PropTypes.string),
};

CollectionSelectorDialog.defaultProps = {
  collections: [],
  defaultSelected: [],
  onCreateCollection: async () => null,
};

export default CollectionSelectorDialog;
