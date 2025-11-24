import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { useAppDispatch, useAppState } from '../../context/AppStateContext.jsx';

const FlaggedContentPage = () => {
  const dispatch = useAppDispatch();
  const { admin } = useAppState();
  const [feedback, setFeedback] = useState(null);

  const handleDismiss = (id) => {
    dispatch({ type: 'ADMIN_DISMISS_FLAG', payload: { flagId: id } });
    setFeedback({ severity: 'success', message: 'Flag dismissed.' });
  };

  const handleRemove = (id, type) => {
    dispatch({ type: 'ADMIN_REMOVE_FLAGGED_ITEM', payload: { flagId: id, removalType: type } });
    setFeedback({ severity: 'warning', message: `Removed flagged ${type}.` });
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
        {admin.flaggedContent.map((item) => (
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
        {!admin.flaggedContent.length && (
          <Typography variant="body2" color="text.secondary">
            No flagged items. You’re all caught up.
          </Typography>
        )}
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Action log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A lightweight record of the last moderation actions taken in this session.
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={1}>
            {admin.actionLog.slice(0, 5).map((entry) => (
              <Stack key={entry.id}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
                <Typography variant="body2">{entry.message}</Typography>
              </Stack>
            ))}
            {!admin.actionLog.length && (
              <Typography variant="body2" color="text.secondary">
                Actions taken here will appear in this session log.
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>

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
