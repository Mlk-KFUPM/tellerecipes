import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AuthLayout from '../../layouts/AuthLayout.jsx';
import BrandMark from '../../components/common/BrandMark.jsx';
import AuthHeader from '../../components/auth/AuthHeader.jsx';
import ControlledTextField from '../../components/forms/ControlledTextField.jsx';
import PasswordField from '../../components/forms/PasswordField.jsx';
import AuthDivider from '../../components/auth/AuthDivider.jsx';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons.jsx';
import AuthRedirectPrompt from '../../components/auth/AuthRedirectPrompt.jsx';

const RegisterPage = () => {
  const navigate = useNavigate();
  const schema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(1, 'Tell us your name'),
        email: z.string().min(1, 'Email is required'),
        password: z.string().min(1, 'Password is required'),
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
      fullName: 'Amina Baker',
      email: 'amina.baker@example.com',
      password: 'password123',
    },
  });

  const onSubmit = handleSubmit((values) => {
    // TODO: integrate with auth API.
    // eslint-disable-next-line no-console
    console.log('register submit', values);
    navigate('/app');
  });

  return (
    <AuthLayout>
      <BrandMark />
      <AuthHeader title="Create your account" subtitle="Join TellerRecipes and bring order to your kitchen." />
      <Stack component="form" spacing={3} onSubmit={onSubmit} noValidate>
        <ControlledTextField control={control} name="fullName" label="Full name" autoComplete="name" />
        <ControlledTextField control={control} name="email" label="Email" type="email" autoComplete="email" />
        <PasswordField control={control} name="password" label="Password" autoComplete="new-password" />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Create account
        </Button>
      </Stack>
      <AuthDivider />
      <SocialAuthButtons onProviderClick={() => {}} />
      <AuthRedirectPrompt prompt="Already have an account?" cta="Sign in" href="/auth/login" />
    </AuthLayout>
  );
};

export default RegisterPage;
