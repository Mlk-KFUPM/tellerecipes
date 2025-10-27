import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import BrandMark from '../../components/common/BrandMark.jsx';
import AuthHeader from '../../components/auth/AuthHeader.jsx';
import ControlledTextField from '../../components/forms/ControlledTextField.jsx';
import PasswordField from '../../components/forms/PasswordField.jsx';
import AuthRedirectPrompt from '../../components/auth/AuthRedirectPrompt.jsx';
import ControlledCheckbox from '../../components/forms/ControlledCheckbox.jsx';

const LoginPage = () => {
  const navigate = useNavigate();
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, 'Email is required'),
        password: z.string().min(1, 'Password is required'),
        remember: z.boolean().optional(),
      }),
    [],
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'amina.baker@example.com',
      password: 'password123',
      remember: true,
    },
  });

  const onSubmit = handleSubmit((values) => {
    // TODO: integrate with auth API layer.
    // eslint-disable-next-line no-console
    console.log('login submit', values);
    navigate('/app');
  });

  return (
    <AuthLayout>
      <BrandMark />
      <AuthHeader title="Welcome back" subtitle="Sign in to plan your next delicious meal." />
      <Stack component="form" spacing={3} onSubmit={onSubmit} noValidate>
        <ControlledTextField control={control} name="email" label="Email" type="email" autoComplete="email" />
        <PasswordField control={control} name="password" label="Password" autoComplete="current-password" />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <FormControlLabel
            control={<ControlledCheckbox control={control} name="remember" />}
            label="Remember me"
            componentsProps={{ typography: { variant: 'body2' } }}
          />
          <Link href="/auth/reset-password" variant="body2" underline="hover">
            Forgot password?
          </Link>
        </Stack>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Sign in
        </Button>
      </Stack>
      <AuthRedirectPrompt prompt="New to TellerRecipes?" cta="Create an account" href="/auth/register" />
    </AuthLayout>
  );
};

export default LoginPage;
