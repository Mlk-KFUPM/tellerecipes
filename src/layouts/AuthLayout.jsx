import PropTypes from 'prop-types';
import { Box, Container, Stack } from '@mui/material';
import AuthHero from '../components/auth/AuthHero.jsx';

const AuthLayout = ({ children }) => (
  <Box
    component="main"
    sx={{
      minHeight: '100vh',
      display: 'flex',
      bgcolor: 'background.default',
    }}
  >
    <AuthHero />
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 10 },
      }}
    >
      <Stack spacing={4} sx={{ width: '100%' }}>
        {children}
      </Stack>
    </Container>
  </Box>
);

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthLayout;
