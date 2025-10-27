import { useMemo, useState } from 'react';
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
import { useAppState } from '../context/AppStateContext.jsx';

const DashboardLayout = ({ role }) => {
  const navigate = useNavigate();
  const { user, shoppingList, session } = useAppState();
  const [anchorEl, setAnchorEl] = useState(null);
  const [navAnchorEl, setNavAnchorEl] = useState(null);

  const shoppingListCount = shoppingList.recipeIds.length;

  const avatarInitials = useMemo(() => {
    const [first = '', second = ''] = user.name.split(' ');
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }, [user.name]);

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

  const currentRole = role || session.role;

  const navItems = useMemo(() => {
    if (currentRole === 'chef') {
      return [{ label: 'Chef Dashboard', to: '/app/chef' }];
    }

    if (currentRole === 'admin') {
      return [{ label: 'Admin Dashboard', to: '/app/admin' }];
    }

    return [
      { label: 'Home', to: '/app/user' },
      { label: 'Collections', to: '/app/user/collections' },
      { label: 'Shopping List', to: '/app/user/shopping-list' },
      { label: 'Profile', to: '/app/user/profile' },
    ];
  }, [currentRole]);

  const shoppingListRoute = currentRole === 'user' ? '/app/user/shopping-list' : null;

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
        {currentRole === 'user' && <MenuItem onClick={() => handleNavigate('/app/user/profile')}>Profile</MenuItem>}
        <MenuItem onClick={() => handleNavigate('/auth/login')}>Sign out</MenuItem>
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
