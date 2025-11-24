import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const AuthDivider = () => (
  <Stack direction="row" alignItems="center" spacing={2}>
    <Divider sx={{ flex: 1 }} />
    <Typography variant="body2" color="text.disabled">
      Or continue with
    </Typography>
    <Divider sx={{ flex: 1 }} />
  </Stack>
);

export default AuthDivider;
