import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';

const providers = [
  { id: 'google', label: 'Google', icon: <GoogleIcon /> },
  { id: 'apple', label: 'Apple', icon: <AppleIcon /> },
  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon /> },
];

const SocialAuthButtons = ({ onProviderClick }) => (
  <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
    {providers.map((provider) => (
      <Button
        key={provider.id}
        variant="outlined"
        fullWidth
        startIcon={provider.icon}
        onClick={() => onProviderClick(provider.id)}
        sx={{
          borderColor: 'grey.200',
          color: 'text.secondary',
          bgcolor: 'background.paper',
          '&:hover': {
            borderColor: 'grey.300',
            bgcolor: 'grey.50',
          },
        }}
      >
        {provider.label}
      </Button>
    ))}
  </Stack>
);

SocialAuthButtons.propTypes = {
  onProviderClick: PropTypes.func,
};

SocialAuthButtons.defaultProps = {
  onProviderClick: () => {},
};

export default SocialAuthButtons;
