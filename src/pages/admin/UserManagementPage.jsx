import { useState } from 'react';
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

const initialUsers = [
  { id: 'u-chef1', username: 'chef1', role: 'Chef', status: 'Active' },
  { id: 'u-user1', username: 'user1', role: 'User', status: 'Active' },
  { id: 'u-chef2', username: 'chef2', role: 'Chef', status: 'Active' },
];

const UserManagementPage = () => {
  const [users, setUsers] = useState(initialUsers);

  const handleDeactivate = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'Deactivated' } : u)));
  };

  const handleDelete = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleRevokeChef = (id) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: 'User' } : u)));
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View, deactivate, or delete users and chefs.
        </Typography>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" />
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
                    {user.role === 'Chef' && (
                      <Button size="small" variant="outlined" onClick={() => handleRevokeChef(user.id)}>
                        Revoke Chef Role
                      </Button>
                    )}
                    {user.status === 'Active' && (
                      <Button size="small" variant="outlined" onClick={() => handleDeactivate(user.id)}>
                        Deactivate
                      </Button>
                    )}
                    <Button size="small" color="error" variant="contained" onClick={() => handleDelete(user.id)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!users.length && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default UserManagementPage;

