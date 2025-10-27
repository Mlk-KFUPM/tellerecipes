import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const ChefDashboardPage = () => (
  <Stack spacing={3}>
    <Stack spacing={1}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Chef workspace (WIP)
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Build chef-focused tools here: recipe publishing, performance insights, and review responses.
      </Typography>
    </Stack>
    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Typography variant="body2" color="text.secondary">
        Placeholder content. Replace this with the chef dashboard widgets (draft lists, analytics, etc.).
      </Typography>
    </Paper>
  </Stack>
);

export default ChefDashboardPage;
