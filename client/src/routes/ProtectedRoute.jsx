import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext.jsx';

const ProtectedRoute = ({ redirectTo }) => {
  const { session } = useAppState();
  const location = useLocation();

  if (!session.isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  redirectTo: PropTypes.string,
};

ProtectedRoute.defaultProps = {
  redirectTo: '/auth/login',
};

export default ProtectedRoute;
