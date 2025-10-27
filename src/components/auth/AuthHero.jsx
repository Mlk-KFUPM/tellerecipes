import { Box, Stack, Typography } from '@mui/material';
import heroIllustration from '../../assets/hero-illustration.svg';

const AuthHero = () => (
  <Box
    sx={{
      flex: { xs: 0, md: 1 },
      display: { xs: 'none', md: 'flex' },
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      px: 6,
    }}
  >
    <Stack spacing={3} sx={{ maxWidth: 420 }}>
      <Typography variant="h3">Tellerecipes</Typography>
      <Typography variant="h6" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
        Plan meals, discover new recipes, and turn inspiration into a ready-to-shop list in minutes.
      </Typography>
      <Box
        component="img"
        src={heroIllustration}
        alt="Meal planning illustration"
        sx={{
          width: '100%',
          maxWidth: 360,
          filter: 'drop-shadow(0 16px 36px rgba(0, 0, 0, 0.2))',
        }}
      />
    </Stack>
  </Box>
);

export default AuthHero;
