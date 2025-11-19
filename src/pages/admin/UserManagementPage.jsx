import { useMemo, useState } from 'react';
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
import { useAppDispatch, useAppState } from '../../context/AppStateContext.jsx';

const roleFilters = [
  { label: 'All roles', value: 'all' },
  { label: 'Admins', value: 'Admin' },
  { label: 'Chefs', value: 'Chef' },
  { label: 'Users', value: 'User' },
];

const UserManagementPage = () => {
  const dispatch = useAppDispatch();
  const { admin, session } = useAppState();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return admin.users.filter((user) => {
      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
      const matchesSearch = term
        ? user.username.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
        : true;
      return matchesRole && matchesSearch;
    });
  }, [admin.users, search, roleFilter]);

  const openConfirm = (action, user) => {
    setConfirm({ action, user });
  };

  const handleAction = () => {
    if (!confirm) return;
    const { action, user } = confirm;
    if (action === 'deactivate') {
      dispatch({ type: 'ADMIN_UPDATE_USER_STATUS', payload: { userId: user.id, status: 'Deactivated' } });
      setFeedback({ severity: 'info', message: `${user.username} deactivated.` });
    } else if (action === 'activate') {
      dispatch({ type: 'ADMIN_UPDATE_USER_STATUS', payload: { userId: user.id, status: 'Active' } });
      setFeedback({ severity: 'success', message: `${user.username} reactivated.` });
    } else if (action === 'delete') {
      dispatch({ type: 'ADMIN_DELETE_USER', payload: { userId: user.id } });
      setFeedback({ severity: 'warning', message: `${user.username} deleted.` });
    } else if (action === 'revoke') {
      dispatch({ type: 'ADMIN_UPDATE_USER_ROLE', payload: { userId: user.id, role: 'User' } });
      setFeedback({ severity: 'info', message: `${user.username} downgraded to User.` });
    } else if (action === 'promote') {
      dispatch({ type: 'ADMIN_UPDATE_USER_ROLE', payload: { userId: user.id, role: 'Chef' } });
      setFeedback({ severity: 'success', message: `${user.username} is now a Chef.` });
    }
    setConfirm(null);
  };

  const isSelf = (user) => user.id === session.actorId;

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
            {filteredUsers.map((user) => (
              <TableRow key={user.id} hover onClick={() => setSelectedUser(user)} sx={{ cursor: 'pointer' }}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" color={user.role === 'Chef' ? 'primary' : 'default'} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    size="small"
                    color={user.status === 'Active' ? 'success' : 'default'}
                    variant={user.status === 'Active' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {user.role === 'User' && user.status === 'Active' && (
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
                    {user.role === 'Chef' && (
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
                    {user.status === 'Active' ? (
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
                      disabled={user.role === 'Admin' || isSelf(user)}
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
              <strong>Joined:</strong> {new Date(selectedUser.joinedAt).toLocaleDateString()}
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
