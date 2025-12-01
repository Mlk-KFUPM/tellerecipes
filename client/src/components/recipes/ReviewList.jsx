import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import dayjs from "dayjs";

const ReviewList = ({ reviews = [] }) => {
  if (!reviews.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No reviews yet. Be the first to share your experience.
      </Typography>
    );
  }

  return (
    <Stack spacing={3}>
      {reviews.map((review) => (
        <Stack key={review.id} spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">{review.displayName || review.author}</Typography>
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="caption" color="text.disabled">
              {dayjs(review.createdAt).format("MMM D, YYYY")}
            </Typography>
          </Stack>
          <Typography variant="body2">{review.comment}</Typography>
          {Array.isArray(review.replies) && review.replies.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                bgcolor: "background.default",
                borderRadius: 2,
                borderStyle: "dashed",
                borderColor: "primary.light",
                p: 2,
                pl: 3,
              }}
            >
              <Stack spacing={1.5}>
                {review.replies.map((reply) => (
                  <Stack key={reply.id} spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2" color="primary.main">
                        {reply.displayName || reply.author}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {dayjs(reply.createdAt).format("MMM D, YYYY h:mm A")}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">{reply.comment}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}
          <Divider />
        </Stack>
      ))}
    </Stack>
  );
};

ReviewList.propTypes = {
  reviews: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      displayName: PropTypes.string,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      replies: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          author: PropTypes.string.isRequired,
          displayName: PropTypes.string,
          comment: PropTypes.string.isRequired,
          createdAt: PropTypes.string.isRequired,
        })
      ),
    })
  ),
};



export default ReviewList;
