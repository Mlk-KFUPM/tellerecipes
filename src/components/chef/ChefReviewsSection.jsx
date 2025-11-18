import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useAppDispatch } from '../../context/AppStateContext.jsx';

const ChefReviewsSection = ({ recipes, chefName }) => {
  const dispatch = useAppDispatch();
  const [drafts, setDrafts] = useState({});

  const recipesWithReviews = useMemo(
    () => recipes.filter((recipe) => (recipe.reviews || []).length > 0),
    [recipes],
  );

  const handleDraftChange = (reviewId, value) => {
    setDrafts((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleReply = (recipeId, reviewId) => {
    const draft = drafts[reviewId]?.trim();
    if (!draft) {
      return;
    }
    dispatch({
      type: 'ADD_REVIEW_REPLY',
      payload: {
        recipeId,
        reviewId,
        reply: {
          author: chefName,
          comment: draft,
        },
      },
    });
    setDrafts((prev) => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Ratings & reviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Reply to diners, keep the conversation going, and provide ingredient substitutions or troubleshooting tips.
          </Typography>
        </Stack>

        {recipesWithReviews.length === 0 ? (
          <Alert severity="info">No reviews yet. Once your recipes start receiving feedback, manage the conversation here.</Alert>
        ) : (
          <Stack spacing={3}>
            {recipesWithReviews.map((recipe) => (
              <Paper key={recipe.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: 'background.default' }}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {recipe.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {recipe.reviews.length} review{recipe.reviews.length > 1 ? 's' : ''}
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack spacing={2}>
                    {recipe.reviews.map((review) => (
                      <Paper key={review.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={1.5}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {review.author}
                            </Typography>
                            <Rating size="small" value={review.rating} readOnly />
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(review.createdAt).format('MMM D, YYYY')}
                            </Typography>
                          </Stack>
                          <Typography variant="body2">{review.comment}</Typography>
                          {(review.replies || []).length > 0 && (
                            <Stack spacing={1} sx={{ bgcolor: 'background.paper', borderRadius: 2, p: 2 }}>
                              {review.replies.map((reply) => (
                                <Stack key={reply.id} spacing={0.5}>
                                  <Typography variant="subtitle2" color="primary.main">
                                    {reply.author}
                                  </Typography>
                                  <Typography variant="body2">{reply.comment}</Typography>
                                  <Typography variant="caption" color="text.disabled">
                                    {dayjs(reply.createdAt).format('MMM D, YYYY h:mm A')}
                                  </Typography>
                                </Stack>
                              ))}
                            </Stack>
                          )}
                          <Stack spacing={1}>
                            <TextField
                              multiline
                              minRows={2}
                              placeholder="Write a helpful reply..."
                              value={drafts[review.id] ?? ''}
                              onChange={(event) => handleDraftChange(review.id, event.target.value)}
                            />
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleReply(recipe.id, review.id)}
                                disabled={!drafts[review.id] || !drafts[review.id].trim()}
                              >
                                Post reply
                              </Button>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

ChefReviewsSection.propTypes = {
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      reviews: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          author: PropTypes.string.isRequired,
          rating: PropTypes.number.isRequired,
          comment: PropTypes.string.isRequired,
          createdAt: PropTypes.string.isRequired,
          replies: PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.string.isRequired,
              author: PropTypes.string.isRequired,
              comment: PropTypes.string.isRequired,
              createdAt: PropTypes.string.isRequired,
            }),
          ),
        }),
      ),
    }),
  ),
  chefName: PropTypes.string,
};

ChefReviewsSection.defaultProps = {
  recipes: [],
  chefName: 'Chef',
};

export default ChefReviewsSection;
