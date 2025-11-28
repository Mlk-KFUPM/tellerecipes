import { useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  listUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from '../../api/admin.js';

const roleFilters = [
  { label: 'All roles', value: 'all' },
  { label: 'Admins', value: 'admin' },
  { label: 'Chefs', value: 'chef' },
  { label: 'Users', value: 'user' },
];

const UserManagementPage = () => {
  const { token, user: authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await listUsers(token);
        const mapped = (res.items || res || []).map((u) => ({ ...u, id: u._id || u.id }));
        setUsers(mapped);
      } catch (err) {
        console.error('Failed to load users', err);
        setFeedback({ severity: 'error', message: err.message || 'Failed to load users' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
      const matchesSearch = term
        ? user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
        : true;
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  const openConfirm = (action, user) => {
    setConfirm({ action, user });
  };

  const handleAction = () => {
    if (!confirm) return;
    const { action, user } = confirm;
    const run = async () => {
      try {
        if (action === 'deactivate') {
          const updated = await updateUserStatus(token, user.id, 'deactivated');
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated, id: updated._id || updated.id } : u)));
          setFeedback({ severity: 'info', message: `${user.username} deactivated.` });
        } else if (action === 'activate') {
          const updated = await updateUserStatus(token, user.id, 'active');
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated, id: updated._id || updated.id } : u)));
          setFeedback({ severity: 'success', message: `${user.username} reactivated.` });
        } else if (action === 'delete') {
          await deleteUser(token, user.id);
          setUsers((prev) => prev.filter((u) => u.id !== user.id));
          setFeedback({ severity: 'warning', message: `${user.username} deleted.` });
        } else if (action === 'revoke') {
          const updated = await updateUserRole(token, user.id, 'user');
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated, id: updated._id || updated.id } : u)));
          setFeedback({ severity: 'info', message: `${user.username} downgraded to User.` });
        } else if (action === 'promote') {
          const updated = await updateUserRole(token, user.id, 'chef');
          setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated, id: updated._id || updated.id } : u)));
          setFeedback({ severity: 'success', message: `${user.username} is now a Chef.` });
        }
      } catch (err) {
        console.error('User action failed', err);
        setFeedback({ severity: 'error', message: err.message || 'Action failed' });
      } finally {
        setConfirm(null);
      }
    };
    run();
  };

  const isSelf = (user) => authUser && user.id === (authUser.id || authUser._id);

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          User management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search, filter, and take actions on diner or chef accounts.
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <TextField
          label="Search users"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, username, or email"
          fullWidth
        />
        <TextField
          label="Filter by role"
          select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          sx={{ minWidth: 200 }}
        >
          {roleFilters.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    Loading users...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              filteredUsers.map((user) => (
              <TableRow key={user.id} hover onClick={() => setSelectedUser(user)} sx={{ cursor: 'pointer' }}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={(user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1)}
                    size="small"
                    color={user.role === 'chef' ? 'primary' : user.role === 'admin' ? 'secondary' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={(user.status || '').charAt(0).toUpperCase() + (user.status || '').slice(1)}
                    size="small"
                    color={user.status === 'active' ? 'success' : 'default'}
                    variant={user.status === 'active' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {user.role === 'user' && user.status === 'active' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.stopPropagation();
                          openConfirm('promote', user);
                        }}
                      >
                        Promote to Chef
                      </Button>
                    )}
                    {user.role === 'chef' && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.stopPropagation();
                          openConfirm('revoke', user);
                        }}
                      >
                        Revoke Chef role
                      </Button>
                    )}
                    {user.status === 'active' ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.stopPropagation();
                          openConfirm('deactivate', user);
                        }}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.stopPropagation();
                          openConfirm('activate', user);
                        }}
                      >
                        Reactivate
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      disabled={user.role === 'admin' || isSelf(user)}
                      onClick={(event) => {
                        event.stopPropagation();
                        openConfirm('delete', user);
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!filteredUsers.length && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    No users match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedUser && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Account details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick snapshot of the selected account.
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2">
              <strong>Name:</strong> {selectedUser.name ?? selectedUser.username}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {selectedUser.email}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong> {selectedUser.role}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong> {selectedUser.status}
            </Typography>
            <Typography variant="body2">
              <strong>Joined:</strong>{' '}
              {selectedUser.joinedAt ? new Date(selectedUser.joinedAt).toLocaleDateString() : '—'}
            </Typography>
          </Stack>
        </Paper>
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)}>
        <DialogTitle>Confirm action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to{' '}
            {confirm?.action === 'delete'
              ? 'delete this account?'
              : confirm?.action === 'promote'
              ? 'promote this user to chef?'
              : confirm?.action === 'revoke'
              ? 'revoke the chef role?'
              : confirm?.action === 'activate'
              ? 'reactivate this account?'
              : 'deactivate this account?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="primary" variant="contained" onClick={handleAction}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {feedback && (
          <Alert severity={feedback.severity} variant="filled" sx={{ width: '100%' }} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        )}
      </Snackbar>
    </Stack>
  );
};

export default UserManagementPage;
