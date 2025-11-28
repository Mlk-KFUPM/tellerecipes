import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../../context/AuthContext.jsx';
import ChefReviewsSection from '../../components/chef/ChefReviewsSection.jsx';
import { fetchProfile, listRecipes, replyToReview } from '../../api/chef.js';

const ChefReviewsPage = () => {
  const { token } = useAuth();
  const [chefProfile, setChefProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, recipesRes] = await Promise.all([fetchProfile(token), listRecipes(token)]);
        setChefProfile({ ...profileRes, id: profileRes._id || profileRes.id });
        const mapped = (recipesRes.items || recipesRes || []).map((r) => ({
          ...r,
          id: r._id || r.id,
          dietary: r.dietary || [],
          ingredients: r.ingredients || [],
          steps: r.steps || [],
        }));
        setRecipes(mapped);
      } catch (err) {
        setError(err.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    if (token) load();
  }, [token]);

  const handleReply = async (recipeId, reviewId, comment) => {
    const updatedReview = await replyToReview(token, recipeId, { reviewId, comment });
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id !== recipeId) return r;
        const reviews = (r.reviews || []).map((rev) => (rev._id?.toString() === reviewId || rev.id === reviewId ? updatedReview : rev));
        return { ...r, reviews };
      }),
    );
  };

  if (loading) {
    return (
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Loading reviews...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Reviews will appear once your chef profile is approved
        </Typography>
        <Typography variant="body1" color="text.secondary">
          After you join as a chef and publish recipes, diner reviews will show up here for follow-up and replies.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Reviews & replies
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Keep diners engaged by thanking them, answering questions, and offering helpful swaps.
        </Typography>
      </Stack>

      <ChefReviewsSection recipes={recipes} chefName={chefProfile.displayName} onReply={handleReply} />
    </Stack>
  );
};

export default ChefReviewsPage;
