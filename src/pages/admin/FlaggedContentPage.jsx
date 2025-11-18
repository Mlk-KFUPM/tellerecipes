import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

const initialFlags = [
  {
    id: 'flag-001',
    type: 'recipe',
    title: 'Recipe: “Spicy Curry”',
    reason: 'Flagged by user2 for “inappropriate language”.',
  },
  {
    id: 'flag-002',
    type: 'review',
    title: 'Review: “Too salty!”',
    reason: 'Flagged by chef1 for “offensive comment”.',
  },
];

const FlaggedContentPage = () => {
  const [flags, setFlags] = useState(initialFlags);

  const handleDismiss = (id) => {
    setFlags((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRemove = (id) => {
    setFlags((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Flagged Content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review reported recipes and reviews.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {flags.map((item) => (
          <Paper key={item.id} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.reason}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => handleDismiss(item.id)}>
                  Dismiss Flag
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRemove(item.id)}
                >
                  {item.type === 'review' ? 'Remove Review' : 'Remove Content'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
        {!flags.length && (
          <Typography variant="body2" color="text.secondary">
            No flagged items. You’re all caught up.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default FlaggedContentPage;

