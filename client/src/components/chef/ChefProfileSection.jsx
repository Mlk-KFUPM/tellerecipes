import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ControlledTextField from '../forms/ControlledTextField.jsx';
import { useAppDispatch } from '../../context/AppStateContext.jsx';

const statusConfig = {
  approved: { label: 'Approved', color: 'success', message: 'You can publish recipes immediately. Keep your bio and specialties up to date.' },
  pending: { label: 'Pending Approval', color: 'warning', message: 'Applications are reviewed within 2 business days. We will notify you once approved.' },
  rejected: { label: 'Needs Follow-up', color: 'error', message: 'We could not approve your application. Update your details and resubmit for review.' },
};

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  signatureDish: z.string().min(1, 'Tell us about your signature dish'),
  bio: z.string().min(20, 'Share a short bio (at least 20 characters)').max(600, 'Keep your bio concise (max 600 characters)'),
  yearsExperience: z.coerce.number().min(0, 'Experience must be 0 or more').max(60, 'Please enter a realistic number of years'),
  specialties: z.string().min(1, 'List at least one specialty'),
  phone: z.string().optional(),
  website: z.string().url('Enter a valid URL, including https://').or(z.literal('')).optional(),
});

const normalizeList = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const ChefProfileSection = ({ profile }) => {
  const dispatch = useAppDispatch();
  const status = statusConfig[profile?.status] || statusConfig.pending;

  const defaultValues = useMemo(
    () => ({
      displayName: profile?.displayName ?? '',
      signatureDish: profile?.signatureDish ?? '',
      bio: profile?.bio ?? '',
      yearsExperience: profile?.yearsExperience ?? 0,
      specialties: (profile?.specialties || []).join(', '),
      phone: profile?.phone ?? '',
      website: profile?.website ?? '',
    }),
    [profile],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit((values) => {
    dispatch({
      type: 'UPDATE_CHEF_PROFILE',
      payload: {
        displayName: values.displayName,
        signatureDish: values.signatureDish,
        bio: values.bio,
        yearsExperience: values.yearsExperience,
        specialties: normalizeList(values.specialties),
        phone: values.phone,
        website: values.website || '',
      },
    });
  });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Chef profile & status
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep your public chef card current. These details appear on published recipes and your chef landing page.
            </Typography>
          </Stack>
          <Chip label={status.label} color={status.color} sx={{ fontWeight: 600 }} />
        </Stack>

        <Alert severity={status.color === 'success' ? 'success' : status.color === 'warning' ? 'warning' : 'error'}>{status.message}</Alert>

        <Divider />

        <Stack component="form" spacing={2} onSubmit={onSubmit} noValidate>
          <ControlledTextField control={control} name="displayName" label="Public display name" />
          <ControlledTextField control={control} name="signatureDish" label="Signature dish" />
          <ControlledTextField control={control} name="bio" label="Short bio" multiline minRows={3} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <ControlledTextField control={control} name="yearsExperience" label="Years of professional experience" type="number" inputProps={{ min: 0 }} />
            <ControlledTextField control={control} name="specialties" label="Specialties (comma separated)" helperText="Example: Moroccan, Plant-Based, Quick Weeknight" />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <ControlledTextField control={control} name="phone" label="Contact phone (optional)" />
            <ControlledTextField control={control} name="website" label="Portfolio or social link" placeholder="https://your-site.com" />
          </Box>

          <Stack direction="row" justifyContent="flex-end" spacing={2} pt={1}>
            <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
              Save profile
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

ChefProfileSection.propTypes = {
  profile: PropTypes.shape({
    id: PropTypes.string,
    displayName: PropTypes.string,
    signatureDish: PropTypes.string,
    bio: PropTypes.string,
    yearsExperience: PropTypes.number,
    specialties: PropTypes.arrayOf(PropTypes.string),
    phone: PropTypes.string,
    website: PropTypes.string,
    status: PropTypes.string,
  }),
};

ChefProfileSection.defaultProps = {
  profile: null,
};

export default ChefProfileSection;
