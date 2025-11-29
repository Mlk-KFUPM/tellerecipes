import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const ReviewForm = ({ onSubmit, isSubmitting = false }) => {
  const schema = useMemo(
    () =>
      z.object({
        rating: z.number().min(1, 'Please add a rating'),
        comment: z.string().min(10, 'Share a few more details (10 characters minimum)'),
      }),
    [],
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, comment: '' },
  });

  const submitHandler = handleSubmit((values) => {
    onSubmit(values);
    reset();
  });

  return (
    <Stack component="form" spacing={2} onSubmit={submitHandler}>
      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Your rating</Typography>
            <Rating value={field.value} onChange={(_, value) => field.onChange(value ?? 0)} />
            {errors.rating && (
              <Typography variant="caption" color="error">
                {errors.rating.message}
              </Typography>
            )}
          </Stack>
        )}
      />
      <TextField
        {...register('comment')}
        label="Share your experience"
        multiline
        minRows={3}
        error={Boolean(errors.comment)}
        helperText={errors.comment?.message}
      />
      <Stack direction="row" justifyContent="flex-end">
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Submit review
        </Button>
      </Stack>
    </Stack>
  );
};

ReviewForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};



export default ReviewForm;
