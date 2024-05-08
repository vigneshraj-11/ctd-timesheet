import React, { useState, useEffect } from 'react';
import { Avatar, Box, Grid, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import { LogoutOutlined } from '@ant-design/icons';
import { getEmployeeDetails, getNotificationService } from '../../../../../apifunctionality/apicalling';
import Tooltip from '@mui/material/Tooltip';

const Profile = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const [employeeDetails, setEmployeeDetails] = useState({
    fullName: '',
    role: '',
    profileImage: '',
    email: '',
    employeeNumber: ''
  });

  useEffect(() => {
    fetchEmployeeDetails(); // Fetch employee details on component mount
    getNotificationTimesheet();
  }, []);

  const getInitials = (name) => {
    const names = name.split(' ');
    let initials = '';
    if (names.length > 1) {
      initials = names[0].charAt(0) + names[1].charAt(0);
    } else if (names.length === 1) {
      initials = names[0].charAt(0);
    }
    return initials;
  };

  const getNotificationTimesheet = async () => {
    try {
      const data = await getNotificationService();
      sessionStorage.setItem('notificationMsg', data[0].message);
      sessionStorage.setItem('notificationClosedate', data[0].closedate);
      sessionStorage.setItem('notificationFrom', data[0].notificationfrom);
      sessionStorage.setItem('notificationType', data[0].notificationtype);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const data = await getEmployeeDetails(); // Call the API function
      setEmployeeDetails(data);
      sessionStorage.setItem('empFN', data.fullName);
    } catch (error) {
      console.error('Error fetching employee details:', error.message);
      // Handle error cases
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('empId');
    localStorage.removeItem('empName');
    localStorage.removeItem('empMailId');
    window.location.href = 'http://ihrms.ctdtechs.com/hrms/index';
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Grid container justifyContent="space-between" alignItems="center">
        {!matchesXs && (
          <Grid item>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar alt={getInitials(employeeDetails.fullName)} src={employeeDetails.profileImage} sx={{ width: 40, height: 40 }} />
              <Stack>
                <Typography variant="h6">{employeeDetails.fullName}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {employeeDetails.role}
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        )}
        <Grid item>
          <Tooltip title="Logout" arrow>
            <IconButton size="large" color="secondary" onClick={handleLogout}>
              <LogoutOutlined />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
