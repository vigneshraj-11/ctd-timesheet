import { AppBar, Box, Toolbar } from '@mui/material';
import Search from './Search';
import Profile from './Profile';

const MobileSection = () => {
  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <AppBar color="inherit">
          <Toolbar>
            <Search />
            <Profile />
          </Toolbar>
        </AppBar>
      </Box>
    </>
  );
};

export default MobileSection;
