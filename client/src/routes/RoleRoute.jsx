import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RoleRoute = ({ allowedRoles, redirectTo }) => {
  const { role } = useAuth();
  const location = useLocation();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

RoleRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  redirectTo: PropTypes.string,
};

RoleRoute.defaultProps = {
  redirectTo: '/app/user',
};

export default RoleRoute;
