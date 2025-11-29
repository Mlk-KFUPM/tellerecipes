import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MenuIcon from '@mui/icons-material/Menu';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getShoppingList } from '../api/user.js';

const DashboardLayout = ({ role }) => {
  const navigate = useNavigate();
  const { user: authUser, role: authRole, token, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [navAnchorEl, setNavAnchorEl] = useState(null);
  const [shoppingListCount, setShoppingListCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    if (!authUser) {
      setShoppingListCount(0);
      return;
    }
    (async () => {
      try {
        const list = await getShoppingList(token);
        if (isMounted) {
          setShoppingListCount((list?.recipeIds || []).length);
        }
      } catch (err) {
        // non-blocking
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [authUser, token]);

  const actorProfile = useMemo(() => authUser || {}, [authUser]);

  const avatarInitials = useMemo(() => {
    const displayName = actorProfile.name || actorProfile.username || actorProfile.email || '';
    const [first = '', second = ''] = displayName.split(' ');
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }, [actorProfile.name, actorProfile.username, actorProfile.email]);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavMenuOpen = (event) => {
    setNavAnchorEl(event.currentTarget);
  };

  const handleNavMenuClose = () => {
    setNavAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleNavMenuClose();
    handleProfileMenuClose();
  };

  const handleSignOut = async () => {
    await logout();
    handleNavigate('/auth/login');
  };

  const currentRole = role || authRole;

  const navItems = useMemo(() => {
    if (currentRole === 'chef') {
      return [
        { label: 'Overview', to: '/app/chef' },
        { label: 'Profile', to: '/app/chef/profile' },
        { label: 'Recipes', to: '/app/chef/recipes' },
        { label: 'Reviews', to: '/app/chef/reviews' },
        { label: 'Analytics', to: '/app/chef/analytics' },
      ];
    }

    if (currentRole === 'admin') {
      return [
        { label: 'Dashboard', to: '/app/admin' },
        { label: 'Categories', to: '/app/admin/categories' },
        { label: 'Moderation', to: '/app/admin/recipe-moderation' },
        { label: 'Flagged', to: '/app/admin/flagged-content' },
        { label: 'Users', to: '/app/admin/user-management' },
      ];
    }

    return [
      { label: 'Home', to: '/app/user' },
      { label: 'Collections', to: '/app/user/collections' },
      { label: 'Shopping List', to: '/app/user/shopping-list' },
      { label: 'Profile', to: '/app/user/profile' },
    ];
  }, [currentRole]);

  const shoppingListRoute = currentRole === 'user' ? '/app/user/shopping-list' : null;
  const roleProfileRoute = currentRole === 'user' ? '/app/user/profile' : currentRole === 'chef' ? '/app/chef/profile' : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Menu">
              <IconButton edge="start" onClick={handleNavMenuOpen} sx={{ display: { xs: 'flex', md: 'none' } }}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              TellerRecipes
            </Typography>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  color="inherit"
                  sx={{
                    fontWeight: 600,
                    '&.active': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {shoppingListRoute && (
              <Tooltip title="Shopping list">
                <IconButton color="primary" onClick={() => handleNavigate(shoppingListRoute)}>
                  <Badge color="primary" badgeContent={shoppingListCount} max={99}>
                    <ShoppingBagIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Account settings">
              <IconButton onClick={handleProfileMenuOpen} size="small" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Avatar sx={{ bgcolor: 'transparent', width: 36, height: 36, fontWeight: 600 }}>{avatarInitials}</Avatar>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={navAnchorEl} open={Boolean(navAnchorEl)} onClose={handleNavMenuClose} sx={{ display: { xs: 'block', md: 'none' } }}>
        {navItems.map((item) => (
          <MenuItem key={item.to} onClick={() => handleNavigate(item.to)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
        {roleProfileRoute && <MenuItem onClick={() => handleNavigate(roleProfileRoute)}>Profile</MenuItem>}
        <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
      </Menu>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Outlet />
      </Container>
    </Box>
  );
};

DashboardLayout.propTypes = {
  role: PropTypes.oneOf(['user', 'chef', 'admin']),
};

DashboardLayout.defaultProps = {
  role: undefined,
};

export default DashboardLayout;
