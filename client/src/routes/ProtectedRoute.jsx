import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ redirectTo }) => {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location, message: 'Please sign in to access this page.' }} />;
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
