import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const AdminDashboardPage = () => (
  <Stack spacing={3}>
    <Stack spacing={1}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Admin console (WIP)
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Use this area to build moderation tools, user management, and platform configuration controls.
      </Typography>
    </Stack>
    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Typography variant="body2" color="text.secondary">
        Placeholder content. Replace with tables, charts, or workflows for administrators.
      </Typography>
    </Paper>
  </Stack>
);

export default AdminDashboardPage;
