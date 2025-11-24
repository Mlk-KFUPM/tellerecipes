import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const AuthRedirectPrompt = ({ prompt, cta, href }) => (
  <Typography variant="body2" textAlign="center" color="text.secondary">
    {prompt}{' '}
    <Link href={href} variant="body2" fontWeight={600} underline="hover">
      {cta}
    </Link>
  </Typography>
);

AuthRedirectPrompt.propTypes = {
  prompt: PropTypes.string.isRequired,
  cta: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default AuthRedirectPrompt;
