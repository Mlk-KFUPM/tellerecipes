import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";

const ReviewList = ({ reviews }) => {
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
            <Typography variant="subtitle2">{review.author}</Typography>
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="caption" color="text.disabled">
              {dayjs(review.createdAt).format("MMM D, YYYY")}
            </Typography>
          </Stack>
          <Typography variant="body2">{review.comment}</Typography>
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
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ),
};

ReviewList.defaultProps = {
  reviews: [],
};

export default ReviewList;
