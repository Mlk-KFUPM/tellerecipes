import { useEffect, useMemo, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext.jsx';
import { fetchProfile, updateProfile, changePassword } from '../../api/user.js';

const ProfilePage = () => {
  const { token, user, setUser, refreshProfile } = useAuth();
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetchProfile(token);
        setUser(res.user);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, setUser]);

  const profileSchema = useMemo(
    () => z.object({
      username: z.string().min(2, 'Enter your username'),
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
    reset: resetProfile,
    formState: { isSubmitting: profileSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
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

  useEffect(() => {
    resetProfile({
      username: user?.username || '',
      email: user?.email || '',
    });
  }, [user, resetProfile]);

  const onProfileSubmit = handleProfileSubmit(async (values) => {
    try {
      const res = await updateProfile(token, { username: values.username, email: values.email });
      setUser(res.user);
      setFeedback({ open: true, message: 'Profile updated successfully', severity: 'success' });
    } catch (err) {
      setFeedback({ open: true, message: err.message || 'Failed to update profile', severity: 'error' });
    }
  });

  const onPasswordSubmit = handlePasswordSubmit((values) => {
    changePassword(token, { currentPassword: values.currentPassword, newPassword: values.newPassword })
      .then(() => {
        setFeedback({ open: true, message: 'Password updated', severity: 'success' });
        resetPasswordForm();
        refreshProfile?.();
      })
      .catch((err) => setFeedback({ open: true, message: err.message || 'Failed to update password', severity: 'error' }));
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
              <ControlledTextField control={profileControl} name="username" label="Username" disabled={loading} />
              <ControlledTextField control={profileControl} name="email" label="Email" type="email" disabled={loading} />
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
