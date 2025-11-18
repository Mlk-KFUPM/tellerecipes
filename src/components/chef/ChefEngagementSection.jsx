import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';

const metricCards = [
  { key: 'views', label: 'Total views' },
  { key: 'saves', label: 'Saves & favourites' },
  { key: 'averageRating', label: 'Average rating' },
  { key: 'ratingsCount', label: 'Ratings received' },
];

const ChefEngagementSection = ({ engagement, recipes }) => {
  const stats = engagement?.recipeStats || {};
  const totals = engagement?.totals;

  const rows = recipes.map((recipe) => {
    const baseStats = stats[recipe.id] || {};
    const rating = recipe.rating || { average: 0, count: 0 };
    return {
      id: recipe.id,
      title: recipe.title,
      status: recipe.status,
      views: baseStats.views ?? 0,
      saves: baseStats.saves ?? 0,
      averageRating: baseStats.averageRating ?? rating.average,
      ratingsCount: baseStats.ratingsCount ?? rating.count,
      comments: baseStats.comments ?? (recipe.reviews || []).length,
    };
  });

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Engagement dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Spot high-performing recipes, track saves, and gauge how diners respond to your work.
          </Typography>
        </Stack>

        {totals && (
          <Grid container spacing={2}>
            {metricCards.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.key}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {metric.key === 'averageRating'
                      ? Number(totals[metric.key] ?? 0).toFixed(1)
                      : totals[metric.key]?.toLocaleString() ?? '0'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Divider />

        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Once you publish recipes, we will surface engagement and rating trends here.
          </Typography>
        ) : (
          <Paper variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recipe</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Views</TableCell>
                  <TableCell align="right">Saves</TableCell>
                  <TableCell align="right">Avg rating</TableCell>
                  <TableCell align="right">Ratings</TableCell>
                  <TableCell align="right">Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {row.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
                        color={row.status === 'approved' ? 'success' : row.status === 'pending' ? 'warning' : 'default'}
                        variant={row.status === 'approved' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">{row.views.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.saves.toLocaleString()}</TableCell>
                    <TableCell align="right">{Number(row.averageRating || 0).toFixed(1)}</TableCell>
                    <TableCell align="right">{row.ratingsCount}</TableCell>
                    <TableCell align="right">{row.comments}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
};

ChefEngagementSection.propTypes = {
  engagement: PropTypes.shape({
    totals: PropTypes.shape({
      views: PropTypes.number,
      saves: PropTypes.number,
      averageRating: PropTypes.number,
      ratingsCount: PropTypes.number,
    }),
    recipeStats: PropTypes.object,
  }),
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string,
      rating: PropTypes.shape({
        average: PropTypes.number,
        count: PropTypes.number,
      }),
      reviews: PropTypes.arrayOf(PropTypes.object),
    }),
  ),
};

ChefEngagementSection.defaultProps = {
  engagement: null,
  recipes: [],
};

export default ChefEngagementSection;
