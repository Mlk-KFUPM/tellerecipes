import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const AuthHeader = ({ title, subtitle }) => (
  <Stack spacing={1} textAlign="center">
    <Typography variant="h4" component="h1">
      {title}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {subtitle}
    </Typography>
  </Stack>
);

AuthHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default AuthHeader;
