import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAppState } from '../../context/AppStateContext.jsx';
import ChefProfileSection from '../../components/chef/ChefProfileSection.jsx';

const ChefProfilePage = () => {
  const { chefProfile } = useAppState();

  if (!chefProfile) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          No chef profile found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit an application to become a TellerRecipes chef so you can create your public bio and start publishing recipes.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Chef profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Update the information diners see when they view your recipes and personal landing page.
        </Typography>
      </Stack>

      <ChefProfileSection profile={chefProfile} />
    </Stack>
  );
};

export default ChefProfilePage;
