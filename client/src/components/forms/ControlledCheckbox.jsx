import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const ControlledCheckbox = ({ control, name, label, ...rest }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        control={<Checkbox {...rest} checked={field.value} onChange={field.onChange} />}
        label={label}
      />
    )}
  />
);

ControlledCheckbox.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
};

export default ControlledCheckbox;
