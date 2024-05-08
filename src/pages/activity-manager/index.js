import React, { useState, useEffect, useCallback } from 'react';
import { Empty } from 'antd';
import { Select, FloatButton, Modal, Input, Button, message, Upload } from 'antd';
import Tooltip from '@mui/material/Tooltip';
import { Grid, Typography, Box, useMediaQuery } from '@mui/material';
import DownloadingIcon from '@mui/icons-material/Downloading';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Close } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import Snackbar from '@mui/material/Snackbar';
import ActivityTable from './ActivityTable';
import MainCard from 'components/MainCard';
import { InboxOutlined } from '@ant-design/icons';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import { setActivityName, fetchRoleActivityData, fetchRoleMap, downloadTemplate } from 'apifunctionality/apicalling';
import '../../assets/style.css';

const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const DashboardDefault = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [timesheetData, setTimesheetData] = useState([]);
  const [apiData, setApiData] = useState({});
  const [uploadDisabled, setUploadDisabled] = useState(false);
  //const [fileList, setFileList] = useState([]);

  const [taskData, setTaskData] = useState({
    activity: '',
    project: '',
    activityDescription: '',
    assignedBy: '',
    comments: ''
  });

  const handleCancel1 = () => {
    setOpen1(false);
  };

  const { Dragger } = Upload;
  const props = {
    name: 'file',
    multiple: false,
    // action: 'http://localhost:8080/timesheetapi/bulkUpload',
    action: 'http://88.198.81.92:8088/timesheet/bulkUpload',
    beforeUpload: (file) => {
      const isXLSX = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isXLSX) {
        setShowSnackbar(true);
        setSnackbarMessage(`${file.name} is not an XLSX file`);
      }
      if (!isLt2M) {
        setShowSnackbar(true);
        setSnackbarMessage(`${file.name} file size must be less than 2MB`);
      }
      return isXLSX && isLt2M ? true : Upload.LIST_IGNORE;
    },
    disabled: uploadDisabled,
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        setUploadDisabled(true);
        fetchData();
        setOpen1(false);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
        setUploadDisabled(false);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
      setUploadDisabled(false);
    }
  };

  const showModal = async () => {
    setTaskData({
      activity: '',
      project: '',
      activityDescription: '',
      assignedBy: '',
      comments: ''
    });
    setOpen(true);
  };
  const fetchActivity = async () => {
    try {
      const data = await fetchRoleMap();
      setApiData(data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const fetchData = async () => {
    try {
      const timesheet = await fetchRoleActivityData();
      const updatedTimesheet = timesheet.map((row, index) => ({ ...row, id: index + 1 }));
      setTimesheetData(updatedTimesheet);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOk = async () => {
    const requiredFields = ['project', 'activity'];
    const emptyField = requiredFields.find((field) => !taskData[field]);

    if (emptyField) {
      const fieldName = emptyField.charAt(0).toUpperCase() + emptyField.slice(1);
      setShowSnackbar(true);
      if (fieldName === 'Project') {
        setSnackbarMessage(`Activity name is required`);
      } else {
        setSnackbarMessage(`Please select role`);
      }
      return;
    }

    const jsonData = {
      projectName: taskData.project,
      processName: taskData.activity
    };

    try {
      setLoading(true);
      const response = await setActivityName(jsonData);
      setShowSnackbar(true);
      if (response === 'Success') {
        setSnackbarMessage('Added Successfully');
        const timesheet = await fetchRoleActivityData();
        const updatedTimesheet = timesheet.map((row, index) => ({ ...row, id: index + 1 }));
        setTimesheetData(updatedTimesheet);
        setTimeout(() => {
          setLoading(false);
          setOpen(false);
        }, 100);
      } else {
        setSnackbarMessage(response);
        setOpen(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error setting timesheet details:', error);
      setLoading(false);
    }
  };

  const [open1, setOpen1] = useState(false);

  const showActivityModal = () => {
    setUploadDisabled(false);
    setLoading(false);
    setOpen1(true);
  };

  useEffect(() => {}, [timesheetData]);

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchData();
    fetchActivity();
  }, []);

  // eslint-disable-next-line
  const handleKeyDown = useCallback((event) => {
    if (event.altKey && event.code === 'KeyN') {
      showModal();
    }
    if (event.altKey && event.code === 'KeyU') {
      showActivityModal();
    }
  });

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12} sm={12} md={12} lg={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">
            Activity Management
            {!matchesXs && (
              <>
                <span>
                  <Tooltip title="Download Template" placement="bottom" arrow>
                    <IconButton color="primary" size="small" aria-label="close" onClick={async () => await downloadTemplate()}>
                      <DownloadingIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Upload File" placement="bottom" arrow>
                    <IconButton color="primary" size="small" aria-label="close" onClick={() => showActivityModal()}>
                      <UploadFileIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </span>
                <span>
                  <Tooltip title="Add Activity" placement="bottom" arrow>
                    <IconButton color="primary" size="small" aria-label="close" onClick={() => showModal()}>
                      <LibraryAddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </span>
              </>
            )}
          </Typography>
        </Grid>

        <Grid item xs={12} md={12} lg={12}>
          <MainCard sx={{ mt: 2 }} content={false}>
            {timesheetData.length > 0 ? (
              <ActivityTable
                key={JSON.stringify(timesheetData)}
                timesheetData={timesheetData}
                setTimesheetData={setTimesheetData}
                apiData={apiData}
              />
            ) : (
              <Box
                sx={{
                  height: '70vh',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Empty />
              </Box>
            )}
          </MainCard>
        </Grid>
      </Grid>
      <FloatButton
        trigger="hover"
        type="primary"
        style={{
          top: 80
        }}
        danger
        icon={<ReplyAllIcon />}
        tooltip={<div>Go Back</div>}
        href="/timesheet"
      ></FloatButton>
      <Modal
        visible={open}
        title="Add Activity Details"
        onCancel={handleCancel}
        footer={[
          <div key="footer" style={{ marginTop: '20px' }}>
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
              Submit
            </Button>
          </div>
        ]}
      >
        <div style={{ marginTop: '20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={24}>
              <Input
                value={taskData.project}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    project: e.target.value
                  })
                }
                placeholder="Activity Name"
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={24}>
              <Select
                showSearch
                id="selectedActivity"
                value={taskData.activity}
                placeholder="Select an Role"
                filterOption={filterOption}
                optionFilterProp="children"
                style={{ width: '100%' }}
                options={[
                  { label: 'Please select Role', value: '', disabled: true },
                  ...Object.keys(apiData).map((key) => ({
                    value: key,
                    label: apiData[key]
                  }))
                ]}
                onChange={(selectedActivity) => {
                  setTaskData({
                    ...taskData,
                    activity: selectedActivity // Update the taskData.activity when an option is selected
                  });
                }}
              />
            </Grid>
          </Grid>
        </div>
      </Modal>
      <Modal
        visible={open1}
        title="Bulk Upload"
        onCancel={handleCancel1}
        footer={[
          <div id="uplaodFooter" key="footer" style={{ marginTop: '40px', display: 'none' }}>
            <Button>Ok</Button>
          </div>
        ]}
      >
        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <Grid container spacing={2}>
            <Grid item xs={24}>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area</p>
                <p className="ant-upload-hint" style={{ color: '#dd6464' }}>
                  Support only for a .xlsx bulk upload.
                </p>
              </Dragger>
            </Grid>
          </Grid>
        </div>
      </Modal>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
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

export default DashboardDefault;
