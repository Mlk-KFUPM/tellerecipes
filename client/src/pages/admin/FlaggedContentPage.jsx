import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { useAuth } from '../../context/AuthContext.jsx';
import { listFlags, resolveFlag, deleteFlag } from '../../api/admin.js';

const FlaggedContentPage = () => {
  const { token } = useAuth();
  const [flags, setFlags] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await listFlags(token);
        const mapped = (res.items || res || []).map((f) => ({ ...f, id: f._id || f.id }));
        setFlags(mapped);
      } catch (err) {
        console.error('Failed to load flags', err);
        setFeedback({ severity: 'error', message: err.message || 'Failed to load flags' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleDismiss = async (id) => {
    try {
      const updated = await resolveFlag(token, id, { status: 'dismissed' });
      setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated, id: updated._id || updated.id } : f)));
      setFeedback({ severity: 'success', message: 'Flag dismissed.' });
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'Failed to dismiss flag' });
    }
  };

  const handleRemove = async (id, type) => {
    try {
      await deleteFlag(token, id, true);
      setFlags((prev) => prev.filter((f) => f.id !== id));
      setFeedback({ severity: 'warning', message: `Removed flagged ${type}.` });
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'Failed to remove content' });
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Flagged content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review escalations submitted by the community. Take action or dismiss items to keep the queue tidy.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {flags.map((item) => (
          <Paper key={item.id} elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={1.5}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {item.title}
                  </Typography>
                  <Chip
                    label={item.type === 'review' ? 'Review' : 'Recipe'}
                    size="small"
                    color={item.type === 'review' ? 'secondary' : 'primary'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {item.reason}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reported by {item.reportedBy} · {new Date(item.flaggedAt).toLocaleDateString()}
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.snippet}
                  </Typography>
                </Paper>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={() => handleDismiss(item.id)}>
                  Dismiss flag
                </Button>
                <Button variant="contained" color="error" onClick={() => handleRemove(item.id, item.type)}>
                  {item.type === 'review' ? 'Remove review' : 'Remove recipe'}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
        {!loading && !flags.length && (
          <Typography variant="body2" color="text.secondary">
            No flagged items. You’re all caught up.
          </Typography>
        )}
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading flags...
          </Typography>
        )}
      </Stack>

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

export default FlaggedContentPage;
