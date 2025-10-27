import { Box, Typography } from '@mui/material';

const BrandMark = () => (
  <Box sx={{ textAlign: 'center' }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        mx: 'auto',
        borderRadius: 4,
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.contrastText',
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: 1,
      }}
    >
      TR
    </Box>
    <Typography variant="overline" sx={{ mt: 1, color: 'text.secondary' }}>
      TellerRecipes
    </Typography>
  </Box>
);

export default BrandMark;
