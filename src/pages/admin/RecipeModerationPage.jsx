import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

const initialSubmissions = [
  { id: 'sub-001', title: 'Vegan Tacos', submitter: 'chef2', status: 'Pending' },
  { id: 'sub-002', title: 'Lemon Cake', submitter: 'chef3', status: 'Pending' },
];

const SubmissionCard = ({ submission, onApprove, onReject }) => (
  <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Stack spacing={1.5}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Recipe: “{submission.title}”
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Submitted by {submission.submitter}
      </Typography>
      <Chip label={`Status: ${submission.status}`} size="small" color={submission.status === 'Approved' ? 'success' : submission.status === 'Rejected' ? 'error' : 'default'} />
      <Stack direction="row" spacing={1}>
        <Button variant="contained" disabled={submission.status !== 'Pending'} onClick={() => onApprove(submission.id)}>
          Approve
        </Button>
        <Button variant="outlined" color="error" disabled={submission.status !== 'Pending'} onClick={() => onReject(submission.id)}>
          Reject
        </Button>
      </Stack>
    </Stack>
  </Paper>
);

const RecipeModerationPage = () => {
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const handleApprove = (id) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Approved' } : s)));
  };

  const handleReject = (id) => {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Rejected' } : s)));
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Recipe Moderation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve or reject new submissions.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {submissions.map((sub) => (
          <Grid key={sub.id} item xs={12} md={6}>
            <SubmissionCard submission={sub} onApprove={handleApprove} onReject={handleReject} />
          </Grid>
        ))}
        {!submissions.length && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              No pending submissions.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
};

export default RecipeModerationPage;

