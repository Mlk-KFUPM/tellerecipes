import { useMemo, useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
import ControlledCheckbox from '../../components/forms/ControlledCheckbox.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { applyChef, fetchProfile } from '../../api/chef.js';

const ChefApplicationPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [chefProfile, setChefProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetchProfile(token);
        setChefProfile(res);
      } catch (err) {
        // Ignore 404s (no profile yet)
        setChefProfile(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const existingEmails = useMemo(() => {
    const emails = new Set();
    if (user?.email) {
      emails.add(user.email.toLowerCase());
    }
    if (chefProfile?.email) {
      emails.add(chefProfile.email.toLowerCase());
    }
    return emails;
  }, [user?.email, chefProfile?.email]);

  const schema = useMemo(
    () =>
      z.object({
        fullName: z.string().min(1, 'Tell us who you are'),
        email: z.string().email('Enter a valid email address'),
        bio: z.string().min(10, 'Share at least 10 characters about your story and approach'),
        specialties: z.string().min(1, 'List the cuisines or styles you focus on'),
        yearsExperience: z.coerce.number().min(0, 'Experience must be 0 or more').max(60, 'Enter a realistic range'),
        website: z.string().url('Include the full URL (https://...)').or(z.literal('')).optional(),
        phone: z.string().optional(),
        signatureDish: z.string().min(1, 'Highlight a signature dish your followers love'),
        acceptTerms: z.literal(true, {
          errorMap: () => ({ message: 'You need to agree to the submission terms' }),
        }),
      }),
    [],
  );

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: user?.email || '',
      bio: '',
      specialties: '',
      yearsExperience: 0,
      website: '',
      phone: '',
      signatureDish: '',
      acceptTerms: false,
    },
  });

  if (loading) return null;

  if (chefProfile?.status === 'approved') {
    return <Navigate to="/app/chef" replace />;
  }

  if (chefProfile?.status === 'pending') {
    return <Navigate to="/app/become-chef/pending" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!token) {
      setError('email', { type: 'manual', message: 'Please sign in before applying.' });
      return;
    }
    try {
      // Email check removed as we now force the user's email
      await applyChef(token, {
        fullName: values.fullName,
        email: values.email,
        displayName: values.fullName,
        yearsExperience: values.yearsExperience,
        bio: values.bio,
        specialties: values.specialties
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        phone: values.phone,
        website: values.website,
        signatureDish: values.signatureDish,
      });
      navigate('/app/become-chef/pending', { replace: true });
    } catch (err) {
      setError('fullName', { type: 'manual', message: err.message || 'Failed to submit application' });
    }
  });

  return (
    <AuthLayout>
      <BrandMark />
      <AuthHeader
        title="Apply to become a chef"
        subtitle="Share your culinary expertise with the TellerRecipes community. Approved chefs can publish recipes and engage with food lovers."
      />
      <Stack component="form" spacing={3} onSubmit={onSubmit} noValidate>
        <ControlledTextField control={control} name="fullName" label="Full name" autoComplete="name" />
        <ControlledTextField control={control} name="email" label="Email" type="email" autoComplete="email" disabled />
        <ControlledTextField control={control} name="bio" label="Professional bio" multiline minRows={3} />
        <ControlledTextField
          control={control}
          name="specialties"
          label="Core specialties"
          helperText="List cuisines or styles separated by commas (e.g., Moroccan, Vegetarian, Pastry)"
        />
        <ControlledTextField control={control} name="signatureDish" label="Signature dish" />
        <ControlledTextField control={control} name="yearsExperience" label="Years of experience" type="number" inputProps={{ min: 0 }} />
        <ControlledTextField control={control} name="website" label="Portfolio or social link (optional)" placeholder="https://chef-portfolio.com" />
        <ControlledTextField control={control} name="phone" label="Contact phone (optional)" />
        <ControlledCheckbox
          control={control}
          name="acceptTerms"
          label="I understand and agree to TellerRecipes’ contributor guidelines and content policies."
        />
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Submit application
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Already an approved chef?{' '}
        <Button variant="text" size="small" onClick={() => navigate('/auth/login')}>
          Sign in
        </Button>
      </Typography>
    </AuthLayout>
  );
};

export default ChefApplicationPage;
