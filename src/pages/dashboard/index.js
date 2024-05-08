import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Empty, notification, Badge } from 'antd';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { DatePicker, Select, FloatButton, Modal, Input, Button, message, Upload, Spin, Checkbox } from 'antd';
import { PlusOutlined, QuestionOutlined } from '@ant-design/icons';
import Draggable from 'react-draggable';
import { Grid, Typography, Box, useMediaQuery } from '@mui/material';
import FastfoodOutlinedIcon from '@mui/icons-material/FastfoodOutlined';
import CoffeeOutlinedIcon from '@mui/icons-material/CoffeeOutlined';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import Tooltip from '@mui/material/Tooltip';
import { Close } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import DownloadingIcon from '@mui/icons-material/Downloading';
//import AddTaskOutlined from '@mui/icons-material/AddTaskOutlined';
import RuleIcon from '@mui/icons-material/Rule';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Snackbar from '@mui/material/Snackbar';
import TimesheetTable from './TimesheetTable';
import MainCard from 'components/MainCard';
import { InboxOutlined, WechatOutlined } from '@ant-design/icons';
import {
  getEODStatus,
  setTimesheetDetails,
  fetchTimesheetData,
  fetchActivityData,
  fetchUserList,
  fetchConfig,
  setActivityName,
  getTimesheetForParticular,
  downloadReport,
  downloadRangeReport,
  downloadSpecfic,
  getNotification,
  setApprovalStatus,
  reporteesMap,
  bulkDownloadFunction,
  setMissedTimesheetDetails
} from 'apifunctionality/apicalling';
import '../../assets/style.css';

const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

const disabledDate = (current) => {
  const today = new Date();
  const todayDate = today.getDate();
  return current && current.date() !== todayDate && ![todayDate - 1, todayDate - 2].includes(current.date());
};

const DashboardDefault = () => {
  const [downloading, setDownloading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [rangePickerValue, setRangePickerValue] = useState(null);
  const [rangePickerValue1, setRangePickerValue1] = useState(null);
  const { TextArea } = Input;
  const empid = localStorage.getItem('empId');
  const { RangePicker } = DatePicker;
  const dateFormat = 'YYYY/MM/DD';
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [timesheetData, setTimesheetData] = useState([]);
  const [pendingStatus, setPendingStatus] = useState(false);
  const [apiData, setApiData] = useState({});
  const [userList, setUserList] = useState([]);
  const [configEmpId, setConfigEmpId] = useState('');
  const [showResetButton, setShowResetButton] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [openSM, setOpenSM] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [enableReportees, setEnableReportees] = useState(false);
  const [bounds, setBounds] = useState({
    left: 10,
    top: 10,
    bottom: 0,
    right: 0
  });
  const draggleRef = useRef(null);
  const [checkBox, setCheckBox] = useState([]);
  const [checkBoxIds, setCheckBoxIds] = useState([]);
  const [openMissModal, setOpenMissModal] = useState(false);

  const onCheckboxChange = (checkedValues) => {
    if (checkedValues.includes('selectAll')) {
      const allValuesExceptSelectAll = checkBox.filter((option) => option.value !== 'selectAll').map((option) => option.value);
      setCheckBoxIds(allValuesExceptSelectAll);
    } else {
      const checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
      const checkedValues = Array.from(checkedCheckboxes).map((checkbox) => checkbox.value);
      setCheckBoxIds(checkedValues);
    }
  };

  const onStart = (_event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y)
    });
  };

  const successMsg = (msg) => {
    messageApi.open({
      type: 'success',
      content: msg,
      style: {
        marginTop: '10vh'
      }
    });
  };
  const errorMsg = (msg) => {
    messageApi.open({
      type: 'error',
      content: msg,
      style: {
        marginTop: '10vh'
      }
    });
  };

  useEffect(() => {
    const showBadgeFromStorage = localStorage.getItem('showBadge');
    if (showBadgeFromStorage) {
      setShowBadge(showBadgeFromStorage === 'true');
    }
  }, []);

  const showShortcutModal = () => {
    localStorage.setItem('showBadge', 'true');
    setShowBadge(true);
    setOpenSM(true);
  };

  const getPendingData = async () => {
    setSpinning(true);
    setShowResetButton(true);
    notificationKeys.forEach((key) => {
      notification.destroy(key, key);
    });
    notificationKeys = [];
    const data = await getNotification();
    const updatedTimesheet2 = data.map((row, index) => ({ ...row, id: index + 1 }));
    setTimesheetData(updatedTimesheet2);
    setPendingStatus(true);
    setSpinning(false);
  };

  let notificationKeys = [];

  const openNotificationWithAPI = useCallback(
    async (placement) => {
      try {
        const data = await getNotification();

        if (!data || data.length === 0) {
          console.log('No notifications to display');
          return;
        }

        data.forEach((notificationData) => {
          const { timesheetId, projectName, activityName, employeeName } = notificationData;

          const btnClick = async (id, action) => {
            const approvalStatus = await setApprovalStatus(id, action);
            if (approvalStatus === 'Success') {
              let newid = key;
              notification.destroy(key, newid);
              const data = await getNotification();
              setNotificationCount(data.length);
            }
          };

          const descriptionNode = (
            <div>
              <p>
                <b>Project:</b> {projectName}
              </p>
              <p>
                <b>Activity:</b> {activityName}
              </p>
              <div style={{ marginTop: '5px', float: 'right' }}>
                <Button type="primary" style={{ marginRight: '8px' }} onClick={() => btnClick(timesheetId, 'Approve')}>
                  Approve
                </Button>
                <Button type="primary" style={{ marginRight: '8px' }} danger onClick={() => btnClick(timesheetId, 'Reject')}>
                  Reject
                </Button>
                {!matchesXs && (
                  <>
                    <Button type="primary" onClick={() => getPendingData()}>
                      View more
                    </Button>
                  </>
                )}
              </div>
            </div>
          );

          const key = `open${timesheetId}`;
          notificationKeys.push(key);
          const args = {
            message: 'Notification from ' + employeeName,
            description: descriptionNode,
            placement,
            duration: 10,
            key
          };

          notification.open(args);
        });
      } catch (error) {
        console.error('Error fetching or processing notifications:', error);
      }
    },
    // eslint-disable-next-line
    []
  );

  const handleSMCancel = () => {
    console.log('Clicked cancel button');
    setOpenSM(false);
  };

  const [taskData, setTaskData] = useState({
    activity: '',
    project: '',
    activityDescription: '',
    assignedBy: '',
    comments: '',
    dateTime: ''
  });
  const [openEOD, setOpenEOD] = useState(false);
  const [openRM, setOpenRM] = useState(false);
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  const handleChatbotCancel = () => {
    setIsChatBotOpen(false);
  };

  const showChatBot = () => {
    setIsChatBotOpen(true);
  };

  const showEODModal = () => {
    setOpenEOD(true);
  };

  const showRMModal = () => {
    setOpenRM(true);
  };

  const handleRMOk = async () => {
    if (rangePickerValue1 === '' || rangePickerValue1 === null) {
      setShowSnackbar(true);
      return setSnackbarMessage('Please Select date range');
    }
    if (!checkBoxIds || checkBoxIds.length === 0) {
      setShowSnackbar(true);
      return setSnackbarMessage('Please atleast one employee');
    }
    setLoading(true);
    const startDate = dayjs(rangePickerValue1[0]).format('YYYY-MM-DD');
    const endDate = dayjs(rangePickerValue1[1]).format('YYYY-MM-DD');
    const data = await bulkDownloadFunction(checkBoxIds, startDate, endDate);
    if (data === 'Success') {
      setShowSnackbar(true);
      setSnackbarMessage('Generated successfully');
      setLoading(false);
      setOpenRM(false);
      setRangePickerValue1('');
    }
  };

  const handleRMCancel = () => {
    setTaskData({
      project: ''
    });
    setRangePickerValue1('');
    setOpenRM(false);
  };

  const handleRangePickerChange = async (dateStrings) => {
    if (dateStrings != null) {
      setRangePickerValue(dateStrings);
      setShowResetButton(!!dateStrings);
      var selectId = selectedEmployee;
      const startDate = dayjs(dateStrings[0]).format('YYYY-MM-DD');
      const endDate = dayjs(dateStrings[1]).format('YYYY-MM-DD');
      try {
        if (selectId === null) {
          selectId = localStorage.getItem('empId');
        }
        const timesheet2 = await getTimesheetForParticular(selectId, startDate, endDate);
        const updatedTimesheet2 = timesheet2.map((row, index) => ({ ...row, id: index + 1 }));
        setTimesheetData(updatedTimesheet2);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  const { Dragger } = Upload;
  const props = {
    name: 'file',
    multiple: true,
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    }
  };

  const handleEODOk = async () => {
    try {
      const jsonData = {
        processName: 'End of Day',
        employeeId: localStorage.getItem('empId'),
        employeeName: localStorage.getItem('empName'),
        employeeMail: localStorage.getItem('empMailId')
      };
      const response = await setTimesheetDetails(jsonData);
      setShowSnackbar(true);
      if (response === 'Success') {
        setSnackbarMessage('Added Successfully');
        const timesheet1 = await fetchTimesheetData();
        const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
        setTimesheetData(updatedTimesheet1);
        setTimeout(() => {
          setOpenEOD(false);
        }, 100);
      } else {
        setSnackbarMessage(response);
        setOpenEOD(false);
        const timesheet1 = await fetchTimesheetData();
        const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
        setTimesheetData(updatedTimesheet1);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const handleEvents = async (event) => {
    const eodStatus = await getEODStatus();
    if (eodStatus === 'yes') {
      setShowSnackbar(true);
      setSnackbarMessage('You have already submitted the EOD for today');
    } else {
      try {
        const jsonData = {
          processName: event,
          employeeId: localStorage.getItem('empId'),
          employeeName: localStorage.getItem('empName'),
          employeeMail: localStorage.getItem('empMailId')
        };
        const response = await setTimesheetDetails(jsonData);
        setShowSnackbar(true);
        if (response === 'Success') {
          setSnackbarMessage('Added Successfully');
          const timesheet1 = await fetchTimesheetData();
          const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
          setTimesheetData(updatedTimesheet1);
          setTimeout(() => {
            setOpenEOD(false);
          }, 100);
        } else {
          setSnackbarMessage(response);
          setOpenEOD(false);
          const timesheet1 = await fetchTimesheetData();
          const updatedTimesheet1 = timesheet1.map((row, index) => ({ ...row, id: index + 1 }));
          setTimesheetData(updatedTimesheet1);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    }
  };

  const showMissModal = () => {
    setTaskData({
      activity: '',
      project: '',
      activityDescription: '',
      assignedBy: '',
      comments: '',
      dateTime: ''
    });
    setOpenMissModal(true);
  };

  const handleMissCancel = () => {
    setOpenMissModal(false);
  };

  const handleMissOk = async () => {
    const requiredFields = ['dateTime', 'activity', 'project', 'activityDescription', 'assignedBy'];
    const emptyField = requiredFields.find((field) => !taskData[field]);

    if (taskData.activity !== 'End of Day' && taskData.activity !== 'Lunch Break' && taskData.activity !== 'Tea Break' && emptyField) {
      const fieldName = emptyField.charAt(0).toUpperCase() + emptyField.slice(1);
      setShowSnackbar(true);
      setSnackbarMessage(`${fieldName} is required`);
      return;
    }

    const selectDate = taskData.dateTime;
    const date = dayjs(selectDate[0]).format('YYYY-MM-DD');
    const startTime = dayjs(selectDate[0]).format('HH:mm:ss');
    const endTime = dayjs(selectDate[1]).format('HH:mm:ss');

    if (endTime < startTime) {
      setShowSnackbar(true);
      return setSnackbarMessage('Please select correct start and end time');
    } else {
      const jsonData = {
        date: date,
        startTime: startTime,
        endTime: endTime,
        projectName: taskData.project,
        processName: taskData.activity,
        activityName: taskData.activityDescription,
        assignedBy: taskData.assignedBy,
        comments: taskData.comments,
        employeeId: localStorage.getItem('empId'),
        employeeName: localStorage.getItem('empName'),
        employeeMail: localStorage.getItem('empMailId')
      };
      try {
        setLoading(true);
        const response = await setMissedTimesheetDetails(jsonData);
        setShowSnackbar(true);
        if (response === 'Success') {
          setSnackbarMessage('Added Successfully');
          const timesheet = await fetchTimesheetData();
          const updatedTimesheet = timesheet.map((row, index) => ({ ...row, id: index + 1 }));
          setTimesheetData(updatedTimesheet);
          setTimeout(() => {
            setLoading(false);
            setOpenMissModal(false);
          }, 100);
        } else {
          setSnackbarMessage(response);
          setOpenMissModal(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error setting timesheet details:', error);
        setLoading(false);
      }
    }
  };

  const handleEODCancel = () => {
    setOpenEOD(false);
  };
  const showModal = async () => {
    const eodStatus = await getEODStatus();
    if (eodStatus === 'yes') {
      setShowSnackbar(true);
      setSnackbarMessage('You have already submitted the EOD for today');
    } else {
      setTaskData({
        activity: '',
        project: '',
        activityDescription: '',
        assignedBy: '',
        comments: '',
        dateTime: ''
      });
      setOpen(true);
    }
  };
  const fetchActivity = async () => {
    try {
      const data = await fetchActivityData();
      setApiData(data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const fetchData = async () => {
    try {
      const timesheet = await fetchTimesheetData();
      const updatedTimesheet = timesheet.map((row, index) => ({ ...row, id: index + 1 }));
      setTimesheetData(updatedTimesheet);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleOk = async () => {
    const requiredFields = ['activity', 'project', 'activityDescription', 'assignedBy'];
    const emptyField = requiredFields.find((field) => !taskData[field]);

    if (taskData.activity !== 'End of Day' && taskData.activity !== 'Lunch Break' && taskData.activity !== 'Tea Break' && emptyField) {
      const fieldName = emptyField.charAt(0).toUpperCase() + emptyField.slice(1);
      setShowSnackbar(true);
      setSnackbarMessage(`${fieldName} is required`);
      return;
    }

    const jsonData = {
      projectName: taskData.project,
      processName: taskData.activity,
      activityName: taskData.activityDescription,
      assignedBy: taskData.assignedBy,
      comments: taskData.comments,
      employeeId: localStorage.getItem('empId'),
      employeeName: localStorage.getItem('empName'),
      employeeMail: localStorage.getItem('empMailId')
    };
    console.log(jsonData);

    try {
      setLoading(true);
      const response = await setTimesheetDetails(jsonData);
      setShowSnackbar(true);
      if (response === 'Success') {
        setSnackbarMessage('Added Successfully');
        const timesheet = await fetchTimesheetData();
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
    setTaskData({
      activity: ''
    });
    setLoading(false);
    setOpen1(true);
  };

  const handleCancel1 = () => {
    setOpen1(false);
  };

  const handleOk1 = async () => {
    try {
      if (taskData.activity === '') {
        setShowSnackbar(true);
        setSnackbarMessage(`Activity name is required`);
        return;
      }
      const jsonData = {
        processName: taskData.activity
      };
      setLoading(true);
      const response = await setActivityName(jsonData);
      setShowSnackbar(true);
      if (response === 'Success') {
        setSnackbarMessage('Added Successfully');
        setTimeout(() => {
          setLoading(false);
          setOpen1(false);
        }, 100);
      } else {
        setSnackbarMessage(response);
        setOpen1(false);
      }
    } catch (error) {
      console.error('Error handling activity name submission:', error);
      setLoading(false);
    }
  };

  const closeDate = sessionStorage.getItem('notificationClosedate');
  const currentNotificationDate = new Date().toISOString().split('T')[0];
  const showNotifyComponent = closeDate && closeDate >= currentNotificationDate;

  const downloadFunction = async () => {
    setDownloading(true); // Show spinner
    try {
      if (selectedEmployee === null && rangePickerValue === null) {
        const data = await downloadReport();
        if (data === 'Success') {
          setDownloading(false);
          return successMsg('File downloaded Successfully');
        }
      } else if (selectedEmployee === null && rangePickerValue != null) {
        const startDate = dayjs(rangePickerValue[0]).format('YYYY-MM-DD');
        const endDate = dayjs(rangePickerValue[1]).format('YYYY-MM-DD');
        const data = await downloadRangeReport(startDate, endDate);
        if (data === 'Success') {
          setDownloading(false);
          return successMsg('File downloaded Successfully');
        }
      } else {
        const id = selectedEmployee;
        const startDate = dayjs(rangePickerValue[0]).format('YYYY-MM-DD');
        const endDate = dayjs(rangePickerValue[1]).format('YYYY-MM-DD');
        const data = await downloadSpecfic(id, startDate, endDate);
        if (data === 'Success') {
          setDownloading(false);
          return successMsg('File downloaded Successfully');
        }
      }
      setDownloading(false);
      return errorMsg('Something went wrong');
    } catch (error) {
      console.error('Error downloading:', error);
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const users = await fetchUserList();
        setUserList(users);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    const configIds = async () => {
      try {
        const data = await fetchConfig();
        const isEmpIdValid = data.includes(parseInt(empid));
        if (isEmpIdValid) {
          setConfigEmpId(empid);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };

    const fetchReportees = async () => {
      try {
        const data = await reporteesMap(empid);
        const options = Object.entries(data).map(([id, name]) => ({
          label: name,
          value: id
        }));
        if (options.length != 0) {
          setEnableReportees(true);
        }
        const optionsWithSelectAll = [{ label: 'Select All', value: 'selectAll' }, ...options];
        setCheckBox(optionsWithSelectAll);
      } catch (error) {
        console.error('Error fetching activity data:', error);
      }
    };
    const notCount = async () => {
      try {
        const data = await getNotification();
        setNotificationCount(data.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    notCount();
    fetchUserData();
    configIds();
    fetchReportees();
  }, [empid, timesheetData, notificationCount]);

  useEffect(() => {
    openNotificationWithAPI('bottomLeft');
  }, [openNotificationWithAPI]);

  const handleCancel = () => {
    setOpen(false);
  };

  const handleChanger = (id) => {
    setTimeout(() => {
      setSelectedEmployee(id);
      setShowResetButton(!!id);
      setShowSnackbar(true);
      console.log(id);
      setSnackbarMessage('Please Select the Date range');
    }, 100);
  };

  const resetFilters = () => {
    setRangePickerValue(null);
    setSelectedEmployee(null);
    setShowResetButton(false);
    setPendingStatus(false);
    fetchData();
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
    if (event.altKey && event.code === 'KeyM') {
      showMissModal();
    }
    if (event.altKey && event.code === 'KeyT') {
      handleEvents('Tea Break');
    }
    if (event.altKey && event.code === 'KeyL') {
      handleEvents('Lunch Break');
    }
    if (event.altKey && event.code === 'KeyC') {
      handleEvents('Cold call');
    }
    if (event.altKey && event.code === 'KeyK') {
      showEODModal();
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
      {contextHolder}
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={4} sm={4} md={4} lg={4} sx={{ mb: -2.25 }}>
          <Typography variant="h5">
            Activity List
            {!matchesXs && (
              <>
                &nbsp;&nbsp;
                <span>
                  <IconButton
                    color="primary"
                    size="small"
                    aria-label="close"
                    onClick={async () => await downloadFunction()}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Spin size="small" />
                    ) : (
                      <>
                        <Tooltip title="Download Report" placement="bottom" arrow>
                          <DownloadingIcon fontSize="small" />
                        </Tooltip>
                      </>
                    )}
                  </IconButton>
                </span>
                {enableReportees ? (
                  <>
                    <span>
                      <IconButton color="primary" size="small" aria-label="close" onClick={showRMModal}>
                        <Tooltip title="Download Reportee Report" placement="bottom" arrow>
                          <SwitchAccountIcon fontSize="small" />
                        </Tooltip>
                      </IconButton>
                    </span>
                    <span>
                      <IconButton color="primary" size="small" aria-label="close" onClick={() => getPendingData()}>
                        {spinning ? (
                          <Spin size="small" />
                        ) : (
                          <>
                            <Tooltip title="Notification" placement="bottom" arrow>
                              <Badge size="small" style={{ fontSize: '10px' }} count={notificationCount}>
                                <NotificationsActiveIcon style={{ color: '#1677ff' }} type="primary" fontSize="small" />
                              </Badge>
                            </Tooltip>
                          </>
                        )}
                      </IconButton>
                    </span>
                  </>
                ) : (
                  <></>
                )}
              </>
            )}
          </Typography>
        </Grid>
        <Grid item xs={2} md={2} lg={2} sx={{ mb: -2.25 }}></Grid>
        <>
          {Object.keys(userList).length > 0 ? (
            <>
              {!matchesXs && (
                <>
                  <Grid item xs={3} sm={4} md={3} lg={3} sx={{ mb: -2.25 }}>
                    <Select
                      showSearch
                      id="selectedEmployee"
                      value={selectedEmployee}
                      placeholder="Select Employee"
                      filterOption={filterOption}
                      optionFilterProp="children"
                      options={[
                        { label: 'Please select Employee', value: '', disabled: true },
                        ...Object.entries(userList).map(([id, name]) => ({
                          label: name,
                          value: id
                        }))
                      ]}
                      onChange={(value) => {
                        setSelectedEmployee(value);
                        setRangePickerValue(null);
                        handleChanger(value);
                      }}
                      style={{
                        width: '100%'
                      }}
                      // mode="multiple"
                    />
                  </Grid>
                  <Grid item xs={3} sm={4} md={3} lg={3} sx={{ mb: -2.25 }}>
                    <RangePicker
                      label="Select range to filter"
                      value={rangePickerValue}
                      style={{ width: '100%' }}
                      format={dateFormat}
                      onChange={(value) => {
                        setRangePickerValue(value);
                        handleRangePickerChange(value);
                      }}
                    />
                  </Grid>
                </>
              )}
            </>
          ) : (
            <>
              {!matchesXs && (
                <>
                  <Grid item xs={3} sm={4} md={3} lg={3} sx={{ mb: -2.25 }} />
                  <Grid item xs={3} sm={4} md={3} lg={3} sx={{ mb: -2.25 }}>
                    <RangePicker
                      label="Select range to filter"
                      value={rangePickerValue}
                      style={{ width: '100%' }}
                      format={dateFormat}
                      onChange={(value) => {
                        setRangePickerValue(value);
                        handleRangePickerChange(value);
                      }}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
        </>
        <>
          {showNotifyComponent && (
            <Grid item xs={12} md={12} lg={12} sx={{ mb: -4.25 }} style={{ textAlign: 'center' }}>
              <Badge.Ribbon text={sessionStorage.getItem('notificationType')}>
                <Card title={sessionStorage.getItem('notificationFrom')} size="small">
                  <p style={{ textAlign: 'justify' }}>
                    Hello {sessionStorage.getItem('empFN')}, {sessionStorage.getItem('notificationMsg')}
                  </p>
                </Card>
              </Badge.Ribbon>
            </Grid>
          )}
        </>
        <Grid item xs={12} md={12} lg={12}>
          <MainCard sx={{ mt: 2 }} content={false}>
            {timesheetData.length > 0 ? (
              <TimesheetTable
                key={JSON.stringify(timesheetData)}
                timesheetData={timesheetData}
                setTimesheetData={setTimesheetData}
                apiData={apiData}
                pendingStatus={pendingStatus}
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
                <Empty
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  imageStyle={{
                    height: 150
                  }}
                  description={
                    <span>
                      No <a href="#">Data</a> Yet
                    </span>
                  }
                ></Empty>
              </Box>
            )}
          </MainCard>
        </Grid>
      </Grid>
      {!matchesXs && (
        <FloatButton
          trigger="hover"
          icon={<QuestionOutlined />}
          badge={{
            dot: showBadge ? false : true
          }}
          style={{
            left: 10,
            bottom: 10,
            width: '30px',
            height: '30px'
          }}
          onClick={showShortcutModal}
        ></FloatButton>
      )}
      <FloatButton
        trigger="hover"
        type="primary"
        icon={<WechatOutlined />}
        style={{
          right: 85
        }}
        tooltip={<div>AI Chat Bot</div>}
        onClick={showChatBot}
      ></FloatButton>
      <FloatButton
        trigger="hover"
        type="primary"
        icon={<RestartAltIcon />}
        style={{
          display: showResetButton ? 'block' : 'none'
        }}
        tooltip={<div>Click here to Reset filter</div>}
        onClick={resetFilters}
      ></FloatButton>
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{
          display: showResetButton ? 'none' : 'block'
        }}
        icon={<PlusOutlined />}
      >
        <FloatButton onClick={() => handleEvents('Tea Break')} tooltip={<div>Tea Break</div>} icon={<CoffeeOutlinedIcon />} />
        <FloatButton onClick={() => handleEvents('Lunch Break')} tooltip={<div>Lunch Break</div>} icon={<FastfoodOutlinedIcon />} />
        <FloatButton onClick={showEODModal} tooltip={<div>EOD</div>} icon={'E'} />
        {configEmpId === empid && (
          <FloatButton
            style={{ display: 'none' }}
            tooltip={<div>Add Activity</div>}
            icon={<PlaylistAddIcon onClick={showActivityModal} />}
          />
        )}
        {configEmpId === empid && <FloatButton href="/activity-manager" tooltip={<div>Activity Manager</div>} icon={<SettingsIcon />} />}
        <FloatButton onClick={showMissModal} tooltip={<div>Missed Task</div>} icon={<RuleIcon />} />
        <FloatButton tooltip={<div>Add Task</div>} icon={<LibraryAddIcon />} onClick={showModal} />
      </FloatButton.Group>
      <Modal
        visible={open}
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move'
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            onFocus={() => {}}
            onBlur={() => {}}
          >
            Add Task Details
          </div>
        }
        onCancel={handleCancel}
        modalRender={(modal) => (
          <Draggable disabled={disabled} bounds={bounds} nodeRef={draggleRef} onStart={(event, uiData) => onStart(event, uiData)}>
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
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
              <Select
                showSearch
                id="selectedActivity"
                value={taskData.activity}
                placeholder="Select an Activity"
                filterOption={filterOption}
                optionFilterProp="children"
                style={{ width: '100%' }}
                options={[
                  { label: 'Please select activity', value: '', disabled: true },
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
            {taskData.activity !== 'End of Day' && taskData.activity !== 'Lunch Break' && taskData.activity !== 'Tea Break' && (
              <>
                <Grid item xs={24}>
                  <Input
                    value={taskData.project}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        project: e.target.value
                      })
                    }
                    placeholder="Project Name"
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={24}>
                  <TextArea
                    value={taskData.activityDescription}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        activityDescription: e.target.value
                      })
                    }
                    rows={4}
                    placeholder="Activity Description"
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={24}>
                  <Input
                    value={taskData.assignedBy}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        assignedBy: e.target.value
                      })
                    }
                    placeholder="Assign By"
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={24}>
                  <TextArea
                    value={taskData.comments}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        comments: e.target.value
                      })
                    }
                    rows={4}
                    placeholder="Any Comments"
                    style={{ width: '100%' }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </div>
      </Modal>
      <Modal
        visible={open1}
        title="Add Activity"
        onCancel={handleCancel1}
        footer={[
          <div key="footer" style={{ marginTop: '20px' }}>
            <Button type="primary" danger onClick={handleCancel1}>
              Cancel
            </Button>
            <Button type="warning">Upload</Button>
            <Button key="submit" variant="contained" type="primary" loading={loading} onClick={handleOk1} style={{ marginLeft: '8px' }}>
              Submit
            </Button>
          </div>
        ]}
      >
        <div style={{ marginTop: '20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={24}>
              <Input
                value={taskData.activity}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    activity: e.target.value
                  })
                }
                placeholder="Activity Name"
                style={{ width: '100%' }}
              />
            </Grid>
            <Grid item xs={24}>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
                </p>
              </Dragger>
            </Grid>
          </Grid>
        </div>
      </Modal>
      <Modal
        open={openEOD}
        title="End of the Day"
        width={300}
        onOk={handleEODOk}
        onCancel={handleEODCancel}
        footer={(_, { OkBtn }) => (
          <>
            <Button type="primary" danger onClick={handleEODCancel}>
              Cancel
            </Button>
            <OkBtn />
          </>
        )}
      >
        {' '}
        <div style={{ marginTop: '20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={24}>
              <Typography variant="h6">Are you sure to Submit!!!</Typography>
            </Grid>
          </Grid>
        </div>
      </Modal>
      <Modal
        open={openRM}
        title="Export Reportee's Record"
        width={600}
        onCancel={handleRMCancel}
        footer={() => (
          <>
            <Button type="primary" danger onClick={handleRMCancel}>
              Cancel
            </Button>
            <Button key="submit" variant="contained" type="primary" loading={loading} onClick={handleRMOk} style={{ marginLeft: '8px' }}>
              Generate
            </Button>
          </>
        )}
      >
        {' '}
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Grid container spacing={2}>
            <Grid item xs={24}>
              <RangePicker
                label="Select range to filter"
                value={rangePickerValue1}
                style={{ width: '100%' }}
                format={dateFormat}
                onChange={(value) => {
                  setRangePickerValue1(value);
                }}
              />
            </Grid>
            <Grid item xs={24}>
              <Checkbox.Group options={checkBox} onChange={onCheckboxChange} />
            </Grid>
          </Grid>
        </div>
      </Modal>
      <Modal title="Keyboard shortcuts" open={openSM} onCancel={handleSMCancel} footer={() => <div style={{ display: 'none' }}></div>}>
        <br />
        <Grid container rowSpacing={4.5} columnSpacing={2.75} spacing={2}>
          <Grid item sm={7} lg={7}>
            <Typography variant="h6">
              <b>New Activity</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button size="small">Alt</Button>&nbsp;&nbsp;+&nbsp;&nbsp;
              <Button size="small">N</Button>
            </Typography>
          </Grid>
          <Grid item sm={5} lg={5}>
            <Typography variant="h6">
              <b>Tea Break</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button size="small">Alt</Button>&nbsp;&nbsp;+&nbsp;&nbsp;
              <Button size="small">T</Button>
            </Typography>
          </Grid>
          <Grid item sm={7} lg={7}>
            <Typography variant="h6">
              <b>Lunch Break</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button size="small">Alt</Button>&nbsp;&nbsp;+&nbsp;&nbsp;
              <Button size="small">L</Button>
            </Typography>
          </Grid>
          <Grid item sm={5} lg={5}>
            <Typography variant="h6">
              <b>Cold Call</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button size="small">Alt</Button>&nbsp;&nbsp;+&nbsp;&nbsp;
              <Button size="small">C</Button>
            </Typography>
          </Grid>
          <Grid item sm={7} lg={7}>
            <Typography variant="h6">
              <b>End of Day</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button size="small">Sht</Button>
              &nbsp;&nbsp;+&nbsp;&nbsp;
              <Button size="small">Alt</Button>&nbsp;&nbsp;+&nbsp;&nbsp;<Button size="small">K</Button>
            </Typography>
          </Grid>
          <Grid item sm={5} lg={5}>
            <Typography variant="h6">
              <b>Missed </b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Button size="small">Alt</Button>&nbsp;&nbsp;+&nbsp;&nbsp;
              <Button size="small">M</Button>
            </Typography>
          </Grid>
        </Grid>
      </Modal>
      <Modal
        visible={openMissModal}
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move'
            }}
            onMouseOver={() => {
              if (disabled) {
                setDisabled(false);
              }
            }}
            onMouseOut={() => {
              setDisabled(true);
            }}
            onFocus={() => {}}
            onBlur={() => {}}
          >
            Add Missed Task Details
          </div>
        }
        onCancel={handleMissCancel}
        modalRender={(modal) => (
          <Draggable disabled={disabled} bounds={bounds} nodeRef={draggleRef} onStart={(event, uiData) => onStart(event, uiData)}>
            <div ref={draggleRef}>{modal}</div>
          </Draggable>
        )}
        footer={[
          <div key="footer" style={{ marginTop: '20px' }}>
            <Button type="primary" danger onClick={handleMissCancel}>
              Cancel
            </Button>
            <Button
              key="submit"
              variant="contained"
              type="primary"
              loading={loading}
              onClick={() => {
                handleMissOk();
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
              <RangePicker
                showTime={{
                  format: 'HH:mm a'
                }}
                format="YYYY-MM-DD hh:mm a"
                style={{
                  width: '100%'
                }}
                value={taskData.dateTime}
                disabledDate={disabledDate}
                onChange={(value) => {
                  setTaskData({
                    ...taskData,
                    dateTime: value
                  });
                }}
              />
            </Grid>
            <Grid item xs={24}>
              <Select
                showSearch
                id="selectedActivity"
                value={taskData.activity}
                placeholder="Select an Activity"
                filterOption={filterOption}
                optionFilterProp="children"
                style={{ width: '100%' }}
                options={[
                  { label: 'Please select activity', value: '', disabled: true },
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
            {taskData.activity !== 'End of Day' && taskData.activity !== 'Lunch Break' && taskData.activity !== 'Tea Break' && (
              <>
                <Grid item xs={24}>
                  <Input
                    value={taskData.project}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        project: e.target.value
                      })
                    }
                    placeholder="Project Name"
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={24}>
                  <TextArea
                    value={taskData.activityDescription}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        activityDescription: e.target.value
                      })
                    }
                    rows={4}
                    placeholder="Activity Description"
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={24}>
                  <Input
                    value={taskData.assignedBy}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        assignedBy: e.target.value
                      })
                    }
                    placeholder="Assign By"
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={24}>
                  <TextArea
                    value={taskData.comments}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        comments: e.target.value
                      })
                    }
                    rows={4}
                    placeholder="Any Comments"
                    style={{ width: '100%' }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </div>
      </Modal>
      <Modal
        width={350}
        open={isChatBotOpen}
        onCancel={handleChatbotCancel}
        footer={[<div key="footer" style={{ display: 'none' }}></div>]}
      >
        <iframe
          id="myFrame"
          title="Timesheet Chatbot"
          src="https://copilotstudio.microsoft.com/environments/Default-db6f1eb9-efb6-4829-97e5-bab95cbc5f58/bots/crfbd_timesheet/webchat?__version__=2"
        ></iframe>
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
