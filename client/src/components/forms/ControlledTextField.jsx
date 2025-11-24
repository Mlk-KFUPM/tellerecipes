import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';

const ControlledTextField = ({ control, name, label, type, InputProps, ...rest }) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <TextField
        {...field}
        {...rest}
        value={field.value ?? ''}
        label={label}
        type={type}
        error={Boolean(fieldState.error)}
        helperText={fieldState.error?.message}
        InputProps={InputProps}
      />
    )}
  />
);

ControlledTextField.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  InputProps: PropTypes.object,
};

ControlledTextField.defaultProps = {
  type: 'text',
  InputProps: undefined,
};

export default ControlledTextField;
