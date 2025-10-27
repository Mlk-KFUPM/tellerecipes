import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';

const ControlledCheckbox = ({ control, name, ...rest }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => <Checkbox {...rest} checked={field.value} onChange={field.onChange} />}
  />
);

ControlledCheckbox.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
};

export default ControlledCheckbox;
