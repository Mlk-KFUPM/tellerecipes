import { useMemo } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import BrandMark from '../../components/common/BrandMark.jsx';
import AuthHeader from '../../components/auth/AuthHeader.jsx';
import ControlledTextField from '../../components/forms/ControlledTextField.jsx';
import PasswordField from '../../components/forms/PasswordField.jsx';
import AuthRedirectPrompt from '../../components/auth/AuthRedirectPrompt.jsx';

import { useAuth } from '../../context/AuthContext.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, 'Email is required'),
        password: z.string().min(1, 'Password is required'),
      }),
    [],
  );

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login({ email: values.email, password: values.password });
      const nextRoute =
        from || (user.role === 'chef' ? '/app/chef' : user.role === 'admin' ? '/app/admin' : '/app/user');
      navigate(nextRoute, { replace: true });
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err.message || 'Failed to sign in. Please check your credentials.',
      });
    }
  });

  return (
    <AuthLayout>
      <BrandMark />
      <AuthHeader title="Welcome back" subtitle="Sign in to plan your next delicious meal." />
      {location.state?.message && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {location.state.message}
        </Alert>
      )}
      {errors.root && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.root.message}
        </Alert>
      )}
      <Stack component="form" spacing={3} onSubmit={onSubmit} noValidate>
        <ControlledTextField control={control} name="email" label="Email" type="email" autoComplete="email" />
        <PasswordField control={control} name="password" label="Password" autoComplete="current-password" />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Sign in
        </Button>
      </Stack>
      <AuthRedirectPrompt prompt="New to TellerRecipes?" cta="Create an account" href="/auth/register" />
      <Typography variant="body2" color="text.secondary">
        Ready to share your own dishes?{' '}
        <Link component={RouterLink} to="/app/become-chef" underline="hover">
          Apply to become a chef
        </Link>
      </Typography>
    </AuthLayout>
  );
};

export default LoginPage;
