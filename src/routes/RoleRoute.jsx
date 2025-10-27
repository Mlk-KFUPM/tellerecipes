import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext.jsx';

const RoleRoute = ({ allowedRoles, redirectTo }) => {
  const { session } = useAppState();
  const location = useLocation();

  if (!allowedRoles.includes(session.role)) {
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
