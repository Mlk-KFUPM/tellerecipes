import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextField from '../../components/forms/ControlledTextField.jsx';
import PasswordField from '../../components/forms/PasswordField.jsx';
import { useAppDispatch, useAppState } from '../../context/AppStateContext.jsx';

const ProfilePage = () => {
  const { user } = useAppState();
  const dispatch = useAppDispatch();
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const profileSchema = useMemo(
    () => z.object({
      name: z.string().min(2, 'Enter your full name'),
      email: z.string().email('Enter a valid email'),
    }),
    [],
  );

  const passwordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(8, 'Current password is required'),
          newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Include at least one letter and one number'),
          confirmPassword: z.string().min(8, 'Please confirm the new password'),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          path: ['confirmPassword'],
          message: 'Passwords must match',
        }),
    [],
  );

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: profileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { isSubmitting: passwordSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = handleProfileSubmit((values) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { name: values.name, email: values.email } });
    setFeedback({ open: true, message: 'Profile updated successfully', severity: 'success' });
  });

  const onPasswordSubmit = handlePasswordSubmit((values) => {
    dispatch({ type: 'UPDATE_PASSWORD', payload: { currentPassword: values.currentPassword, newPassword: values.newPassword } });
    setFeedback({ open: true, message: 'Password updated', severity: 'success' });
    resetPasswordForm();
  });

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal information and account security.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
            <Stack spacing={3} component="form" onSubmit={onProfileSubmit}>
              <Stack spacing={1}>
                <Typography variant="h6">Personal information</Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your name and email address used across the platform.
                </Typography>
              </Stack>
              <ControlledTextField control={profileControl} name="name" label="Full name" />
              <ControlledTextField control={profileControl} name="email" label="Email" type="email" />
              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={profileSubmitting}>
                  Save changes
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
            <Stack spacing={3} component="form" onSubmit={onPasswordSubmit}>
              <Stack spacing={1}>
                <Typography variant="h6">Change password</Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a strong password with letters and numbers to keep your account secure.
                </Typography>
              </Stack>
              <PasswordField control={passwordControl} name="currentPassword" label="Current password" />
              <PasswordField control={passwordControl} name="newPassword" label="New password" />
              <PasswordField control={passwordControl} name="confirmPassword" label="Confirm new password" />
              <Stack direction="row" justifyContent="flex-end">
                <Button type="submit" variant="contained" disabled={passwordSubmitting}>
                  Update password
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback.severity} variant="filled" sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default ProfilePage;
