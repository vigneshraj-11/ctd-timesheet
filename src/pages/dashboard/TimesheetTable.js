import React, { useState } from 'react';
import { Grid, Box, useMediaQuery } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarFilterButton, GridToolbarExport, gridClasses } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PauseIcon from '@mui/icons-material/Pause';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PropTypes from 'prop-types';
import '../../assets/customCSS.css';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { Modal, Button, Input, Spin } from 'antd';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Snackbar from '@mui/material/Snackbar';
import { Close } from '@mui/icons-material';
import {
  setPausingStatus,
  fetchTimesheetData,
  updateTimesheetDetails,
  managePausingDetails,
  bulkApprovalFunction,
  getNotification
} from 'apifunctionality/apicalling';

const formatTime = (time) => {
  const [hours, minutes, seconds] = time.split(':');
  const date = new Date(0, 0, 0, hours, minutes, seconds);
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const calculateDuration = (startTime, endTime) => {
  const startDateTime = new Date(`2000-01-01T${startTime}`);
  let endDateTime;

  if (endTime) {
    endDateTime = new Date(`2000-01-01T${endTime}`);
    if (endDateTime < startDateTime) {
      // If end time is earlier than start time, set end time to next day
      endDateTime.setDate(endDateTime.getDate() + 1);
    }
  } else {
    endDateTime = new Date();
  }

  const durationInMilliseconds = endDateTime - startDateTime;
  const hours = Math.floor(durationInMilliseconds / 3600000);
  const minutes = Math.floor((durationInMilliseconds % 3600000) / 60000);
  const seconds = Math.floor((durationInMilliseconds % 60000) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};

const TimesheetTable = ({ timesheetData, apiData, pendingStatus }) => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [spning, setSpning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [timesheetId, setTimesheetId] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [timesheetDataState, setTimesheetDataState] = useState(timesheetData);
  const checkboxSelection = pendingStatus;
  const [arrayIds, setArrayIds] = useState([]);
  const [checkboxSelectionData, setCheckboxSelectionData] = useState(true);

  const handleApprovals = async (actions) => {
    const data = await bulkApprovalFunction(arrayIds, actions);
    if (data === 'Success') {
      setShowSnackbar(true);
      setSnackbarMessage('Updated Successfully');
      const timesheet1 = await getNotification();
      const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
      setTimesheetDataState(updatedTimesheet1);
      setCheckboxSelectionData(!checkboxSelection);
    } else {
      setShowSnackbar(true);
      setSnackbarMessage('Something went wrong...');
    }
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
        <GridToolbarExport
          sx={{ display: 'none' }}
          csvOptions={{
            fileName: 'TimesheetReport'
          }}
          printOptions={{ disableToolbarButton: true }}
          showQuickFilter={true}
          quickFilterProps={{ debounceMs: 250 }}
        />
        {checkboxSelection && (
          <div style={{ marginTop: 10, marginBottom: 10, marginRight: 'auto' }}>
            <Button style={{ marginRight: '10px' }} type="primary" onClick={() => handleApprovals('approved')}>
              Approve
            </Button>
            <Button type="primary" danger onClick={() => handleApprovals('rejected')}>
              Reject
            </Button>
          </div>
        )}
      </GridToolbarContainer>
    );
  }

  const handleReasonChange = (e) => {
    showPauseModal;
    setPauseReason(e.target.value);
  };

  const showPauseModal = (id) => {
    setTimesheetId(id);
    setLoading(false);
    setShowModal(true);
    setPauseReason('');
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const handleOk = async () => {
    setLoading(true);
    const response = await setPausingStatus(timesheetId, pauseReason);
    setShowSnackbar(true);
    if (response === 'Success') {
      setSnackbarMessage('Added Successfully');
      const timesheet1 = await fetchTimesheetData();
      const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
      setTimesheetDataState(updatedTimesheet1);
    }
    setShowModal(false);
    setLoading(false);
  };

  const renderCellAction = (params) => {
    const sessionId = localStorage.getItem('empId');
    const rowId = params.row.employeeId;
    const isTaskCompleted = !!params.row.endTime;
    const hasPauseReason = !!params.row.pauseReason;
    const hasApprovalStatus = params.row.approvalStatus;

    const handleClick = () => {
      if (!isTaskCompleted) {
        showPauseModal(params.row.timesheetId);
      }
    };

    const handlePlayClick = async () => {
      setSpning(true);
      const data = await managePausingDetails(params.row.timesheetId);
      if (data === 'Success') {
        setSpning(false);
        const timesheet1 = await fetchTimesheetData();
        const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
        setTimesheetDataState(updatedTimesheet1);
      }
    };

    const renderIcon = () => {
      if (isTaskCompleted && !hasPauseReason) {
        return (
          <>
            {sessionId == rowId ? (
              <IconButton aria-label="complete">
                <Tooltip title="Complete" placement="bottom" arrow>
                  <TaskAltIcon sx={{ color: 'green' }} />
                </Tooltip>
              </IconButton>
            ) : (
              <></>
            )}
            {hasApprovalStatus === 'pending' ? (
              <Tooltip title="Waiting for Approval" placement="bottom" arrow>
                <IconButton style={{ color: 'orange', fontSize: 18, fontWeight: 'bold' }}>W</IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            {hasApprovalStatus === 'rejected' ? (
              <Tooltip title="Rejected" placement="bottom" arrow>
                <IconButton style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>R</IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            {hasApprovalStatus === 'approved' ? (
              <Tooltip title="Approved" placement="bottom" arrow>
                <IconButton style={{ color: 'green', fontSize: 18, fontWeight: 'bold' }}>A</IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            <IconButton sx={{ display: 'none' }} aria-label="Delete">
              <Tooltip title="Delete" placement="bottom" arrow>
                <DeleteForeverIcon sx={{ color: 'red' }} />
              </Tooltip>
            </IconButton>
          </>
        );
      } else {
        return (
          <>
            {sessionId == rowId ? (
              <IconButton aria-label={hasPauseReason ? 'play' : 'pause'}>
                {hasPauseReason ? (
                  spning ? (
                    <Spin size="small" />
                  ) : (
                    <Tooltip title="Play" placement="bottom" arrow>
                      <PlayCircleOutlineIcon sx={{ color: 'blue' }} onClick={handlePlayClick} />
                    </Tooltip>
                  )
                ) : (
                  <Tooltip title="Pause" placement="bottom" arrow>
                    <PauseIcon sx={{ color: 'orange' }} onClick={handleClick} />
                  </Tooltip>
                )}
              </IconButton>
            ) : (
              <></>
            )}
            {hasApprovalStatus === 'pending' ? (
              <Tooltip title="Waiting for Approval" placement="bottom" arrow>
                <IconButton style={{ color: 'orange', fontSize: 18, fontWeight: 'bold' }}>W</IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            {hasApprovalStatus === 'rejected' ? (
              <Tooltip title="Rejected" placement="bottom" arrow>
                <IconButton style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>R</IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            {hasApprovalStatus === 'approved' ? (
              <Tooltip title="Approved" placement="bottom" arrow>
                <IconButton style={{ color: 'green', fontSize: 18, fontWeight: 'bold' }}>A</IconButton>
              </Tooltip>
            ) : (
              <></>
            )}
            <IconButton sx={{ display: 'none' }} aria-label="Delete">
              <Tooltip title="Delete" placement="bottom" arrow>
                <DeleteForeverIcon sx={{ color: 'red' }} />
              </Tooltip>
            </IconButton>
          </>
        );
      }
    };

    return <div style={{ display: 'flex', justifyContent: 'center' }}>{renderIcon()}</div>;
  };

  const processRowUpdate = React.useCallback(async (newRow) => {
    try {
      const jsonData = {
        timesheetId: newRow.timesheetId,
        projectName: newRow.projectName,
        processName: newRow.processName,
        activityName: newRow.activityName,
        assignedBy: newRow.assignedBy,
        comments: newRow.comments,
        employeeId: localStorage.getItem('empId'),
        employeeName: localStorage.getItem('empName'),
        employeeMail: localStorage.getItem('empMailId')
      };
      const data = await updateTimesheetDetails(jsonData);
      if (data === 'Success') {
        const timesheet1 = await fetchTimesheetData();
        const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
        setTimesheetDataState(updatedTimesheet1);
      }
    } catch (error) {
      reject(error);
    }
  }, []);

  const columns = [
    { field: 'date', headerName: 'Date', ...(matchesXs ? { width: 120 } : { flex: 1 }), headerClassName: 'super-app-theme--header' },
    {
      field: 'employeeName',
      hideable: true,
      headerName: 'Employee Name',
      // ...(checkboxSelection ? { hideable: false } : { hideable: true }),
      sx: { display: 'none' },
      ...(matchesXs ? { width: 200 } : { flex: 1 }),
      editable: true,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'projectName',
      headerName: 'Project',
      ...(matchesXs ? { width: 200 } : { flex: 1 }),
      editable: true,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'processName',
      headerName: 'Activity',
      ...(matchesXs ? { width: 200 } : { flex: 1 }),
      headerClassName: 'super-app-theme--header',
      type: 'singleSelect',
      valueOptions: Object.values(apiData),
      editable: true
    },
    {
      field: 'activityName',
      headerName: 'Activity Description',
      editable: true,
      ...(matchesXs ? { width: 300 } : { flex: 2 }),
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'assignedBy',
      headerName: 'Assigned By',
      ...(matchesXs ? { width: 200 } : { flex: 1 }),
      editable: true,
      headerClassName: 'super-app-theme--header'
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      ...(matchesXs ? { width: 100 } : { flex: 1 }),
      valueGetter: (params) => formatTime(params.row.startTime),
      headerClassName: 'super-app-theme--header',
      sortable: false,
      filterable: false
    },
    {
      field: 'endTime',
      headerName: 'End Time',
      ...(matchesXs ? { width: 100 } : { flex: 1 }),
      renderCell: (params) => {
        if (params.row.endTime) {
          return formatTime(params.row.endTime);
        } else {
          return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Chip label="In Progress" color="warning" variant="outlined" size="small" />
            </div>
          );
        }
      },
      headerClassName: 'super-app-theme--header',
      sortable: false,
      filterable: false
    },
    {
      field: 'duration',
      headerName: 'Duration',
      ...(matchesXs ? { width: 150 } : { flex: 1 }),
      renderCell: (params) => {
        if (params.row.endTime) {
          return calculateDuration(params.row.startTime, params.row.endTime);
        } else {
          return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Chip label="In Progress" color="warning" variant="outlined" size="small" />
            </div>
          );
        }
      },
      headerClassName: 'super-app-theme--header',
      sortable: false,
      filterable: false
    },
    {
      field: 'comments',
      headerName: 'Comments',
      ...(matchesXs ? { width: 150 } : { flex: 1 }),
      headerClassName: 'super-app-theme--header',
      editable: true,
      renderCell: (params) => {
        const comment = params.value;
        if (!comment || comment.trim() === '') {
          return <span style={{ color: 'grey' }}>No Comments</span>;
        } else {
          return comment;
        }
      }
    },
    {
      field: 'action',
      headerName: 'Action/Status',
      ...(matchesXs ? { width: 200 } : { flex: 1 }),
      headerClassName: 'super-app-theme--header',
      sortable: false,
      filterable: false,
      // disableExport: true,
      renderCell: renderCellAction // using the extracted function
    }
  ];

  const onRowSelectionModelChangeFun = (selectionModel) => {
    const selectedTimesheetIds = selectionModel.map((id) => {
      const selectedRow = timesheetDataState.find((row) => row.id === id);
      return selectedRow ? selectedRow.timesheetId : null;
    });
    setArrayIds(selectedTimesheetIds);
  };

  return (
    <>
      <Box
        sx={{
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
          {...(matchesXs ? {} : { autoHeight: true, components: { Toolbar: CustomToolbar } })}
          sx={{
            overFlow: 'hidden',
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
          processRowUpdate={processRowUpdate}
          columnVisibilityModel={{
            employeeName: checkboxSelection ? true : false
          }}
          {...(checkboxSelection ? { checkboxSelection: { checkboxSelectionData } } : {})}
          onRowSelectionModelChange={(ids) => onRowSelectionModelChangeFun(ids)}
        />
      </Box>
      <Modal
        open={showModal}
        title="Pause the Task"
        width={400}
        onCancel={handleCancel}
        footer={() => (
          <div style={{ marginTop: '5%' }}>
            <Button type="primary" danger onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              key="submit"
              variant="contained"
              type="primary"
              loading={loading}
              onClick={() => {
                handleOk();
              }}
              style={{ marginLeft: '8px' }}
            >
              Ok
            </Button>
          </div>
        )}
      >
        {' '}
        <div style={{ marginTop: '20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={24}>
              <Input placeholder="Reason for Pause" style={{ width: '100%' }} value={pauseReason} onChange={handleReasonChange} />
            </Grid>
          </Grid>
        </div>
      </Modal>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => setShowSnackbar(false)}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

TimesheetTable.propTypes = {
  timesheetData: PropTypes.array.isRequired,
  apiData: PropTypes.object.isRequired,
  pendingStatus: PropTypes.object.isRequired
};

export default TimesheetTable;
