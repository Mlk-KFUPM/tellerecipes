import { Navigate, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import BrandMark from '../../components/common/BrandMark.jsx';
import AuthHeader from '../../components/auth/AuthHeader.jsx';
import { useAppState } from '../../context/AppStateContext.jsx';

const ChefApplicationPendingPage = () => {
  const navigate = useNavigate();
  const { chefProfile } = useAppState();

  if (!chefProfile) {
    return <Navigate to="/auth/become-chef" replace />;
  }

  if (chefProfile.status === 'approved') {
    return <Navigate to="/app/chef" replace />;
  }

  return (
    <AuthLayout>
      <BrandMark />
      <AuthHeader
        title="We&apos;re reviewing your application"
        subtitle="Our culinary partnerships team typically approves new chefs within two business days."
      />
      <Stack spacing={3}>
        <Alert severity="info">
          Thanks for applying, {chefProfile.displayName || chefProfile.name}! Keep an eye on your inbox for updates from TellerRecipes. As soon as we
          approve your profile you&apos;ll be able to publish recipes.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          While you wait, you can prepare your first recipes or tidy up your ingredient lists. We&apos;ll send a confirmation email when your account is ready.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => navigate('/app/chef')}>
            View chef workspace
          </Button>
          <Button variant="text" onClick={() => navigate('/auth/login')}>
            Return to sign in
          </Button>
        </Stack>
      </Stack>
    </AuthLayout>
  );
};

export default ChefApplicationPendingPage;
