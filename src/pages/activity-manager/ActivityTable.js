import React, { useState } from 'react';
import { Box } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, gridClasses } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import '../../assets/customCSS.css';
import { Switch } from 'antd';
import { fetchRoleActivityData, updateActivityDetails, updateActivityFlag } from 'apifunctionality/apicalling';

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarFilterButton />
      <GridToolbarExport
        csvOptions={{
          fileName: 'TimesheetReport'
        }}
        printOptions={{ disableToolbarButton: true }}
        showQuickFilter={true}
        quickFilterProps={{ debounceMs: 250 }}
      />
    </GridToolbarContainer>
  );
}

const ActivityTable = ({ timesheetData, apiData }) => {
  const [timesheetDataState, setTimesheetDataState] = useState(timesheetData.map((row, index) => ({ ...row, id: index + 1 })));

  const handleSwitchChange = async (id, newValue) => {
    const data = await updateActivityFlag(id, newValue);
    if (data === 'Success') {
      const timesheet1 = await fetchRoleActivityData();
      const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
      setTimesheetDataState(updatedTimesheet1);
    }
  };

  const processRowUpdate = React.useCallback(async (newRow) => {
    try {
      const jsonData = {
        timesheetId: newRow.activity_id,
        projectName: newRow.activity_name,
        processName: newRow.role
      };
      const data = await updateActivityDetails(jsonData);
      if (data === 'Success') {
        const timesheet1 = await fetchRoleActivityData();
        const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
        setTimesheetDataState(updatedTimesheet1);
      }
    } catch (error) {
      reject(error);
    }
  }, []);

  const columns = [
    { field: 'id', headerName: '#', width: 200, headerClassName: 'super-app-theme--header', sortable: false },
    { field: 'activity_name', headerName: 'Activity Name', width: 450, headerClassName: 'super-app-theme--header', editable: true },
    {
      field: 'role',
      headerName: 'Role',
      width: 415,
      editable: true,
      headerClassName: 'super-app-theme--header',
      type: 'singleSelect',
      valueOptions: Object.values(apiData)
    },
    {
      field: 'flag',
      headerName: 'Action',
      width: 400,
      renderCell: (params) => (
        <Switch defaultChecked={params.value === 1} size="small" onChange={(event) => handleSwitchChange(params.row.activity_id, event)} />
      ),
      headerClassName: 'super-app-theme--header'
    }
  ];

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .super-app-theme--header': {
            backgroundColor: 'rgba(22, 119, 255, 1)',
            color: 'white',
            fontWeight: 'bold'
          }
        }}
      >
        <DataGrid
          rows={timesheetDataState}
          columns={columns}
          sx={{
            fontSize: '13px',
            scrollbars: 'none',
            borderBottom: '1px solid #c3c3c3',
            [`& .${gridClasses.row}`]: {
              bgcolor: (theme) => (theme.palette.mode === 'light' ? 'rgb(250 250 250 / 90%)' : 'rgb(250 250 250 / 90%)')
            }
          }}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10
              }
            }
          }}
          getRowSpacing={(params) => ({
            top: params.isFirstVisible ? 0 : 2,
            bottom: params.isLastVisible ? 0 : 2
          })}
          pageSizeOptions={[10, 50, 100]}
          components={{
            Toolbar: CustomToolbar
          }}
          processRowUpdate={processRowUpdate}
        />
      </Box>
    </>
  );
};

ActivityTable.propTypes = {
  timesheetData: PropTypes.array.isRequired,
  apiData: PropTypes.object.isRequired
};

export default ActivityTable;
