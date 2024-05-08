// material-ui
import { Box, useMediaQuery } from '@mui/material';
import Search from './Search';
import Profile from './Profile';
import MobileSection from './MobileSection';
import NavLogo from './NavLogo';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <>
      {!matchesXs && <Search />}
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}
      {!matchesXs && <NavLogo />}
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  );
};

export default HeaderContent;
