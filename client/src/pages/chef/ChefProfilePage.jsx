import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from '../../context/AuthContext.jsx';
import ChefProfileSection from '../../components/chef/ChefProfileSection.jsx';
import { fetchProfile, updateProfile } from '../../api/chef.js';

const ChefProfilePage = () => {
  const { token } = useAuth();
  const [chefProfile, setChefProfile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchProfile(token);
        setChefProfile({ ...res, id: res._id || res.id });
      } catch (err) {
        setError(err.message || 'Failed to load chef profile');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const handleSave = async (payload) => {
    try {
      const res = await updateProfile(token, payload);
      setChefProfile({ ...res, id: res._id || res.id });
      setFeedback({ severity: 'success', message: 'Profile updated' });
    } catch (err) {
      setFeedback({ severity: 'error', message: err.message || 'Failed to update profile' });
    }
  };

  if (loading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading chef profile...
      </Typography>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          No chef profile found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit an application to become a TellerRecipes chef so you can create your public bio and start publishing recipes.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Chef profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update the information diners see when they view your recipes and personal landing page.
        </Typography>
      </Stack>

      <ChefProfileSection profile={chefProfile} onSave={handleSave} />
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback && (
          <Alert severity={feedback.severity} variant="filled" sx={{ width: '100%' }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}
      </Snackbar>
    </Stack>
  );
};

export default ChefProfilePage;
