// const BASE_URL = 'http://88.198.81.92:8088/timesheet/';
export const BASE_URL = 'http://localhost:8080/timesheetapi/';

var empid = '';

export const setSessionEmpId = (empId) => {
  empid = empId;
  localStorage.setItem('empId', empid);
};

empid = localStorage.getItem('empId');
const emprole = localStorage.getItem('empRole');

export const getEmployeeDetails = async () => {
  try {
    const response = await fetch(`${BASE_URL}getEmployeeDetails?employeeId=${empid}`);
    if (response.ok) {
      const data = await response.json();
      const { role } = data;
      localStorage.setItem('empRole', role);
      return data;
    } else {
      throw new Error('Failed to fetch employee details');
    }
  } catch (error) {
    throw new Error('Error fetching employee details:', error);
  }
};

export const fetchTimesheetData = async () => {
  try {
    const response = await fetch(`${BASE_URL}getTimesheet?employeeId=${empid}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export const getNotification = async () => {
  try {
    const response = await fetch(`${BASE_URL}getNotification?empId=${empid}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export const setApprovalStatus = async (id, action) => {
  try {
    const response = await fetch(`${BASE_URL}setApprovalStatus?timesheetId=${id}&action=${action}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export const getEODStatus = async () => {
  const url = `${BASE_URL}getEODStatus?employeeId=${parseInt(empid)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error fetching EOD status:', error);
  }
};

export const setTimesheetDetails = async (jsonData) => {
  const url = `${BASE_URL}setTimesheetDetails`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error setting timesheet details:', error);
  }
};

export async function fetchActivityData() {
  try {
    const url = `${BASE_URL}activityMap?role=${emprole}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Error fetching data');
  }
}

export async function fetchUserList() {
  try {
    const url = `${BASE_URL}reporteeEmployeesMap?employeeId=${parseInt(empid)}`;
    // const url = `${BASE_URL}reporteeEmployeesMap?employeeId=2`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user list:', error);
    return [];
  }
}

export async function fetchConfig() {
  try {
    const response = await fetch(`${BASE_URL}getConfigEmpId`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching timesheet data:', error);
  }
}

export const setActivityName = async (jsonData) => {
  const url = `${BASE_URL}setActivityName`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error setting timesheet details:', error);
  }
};

export const getTimesheetForParticular = async (newId, startDate, endDate) => {
  try {
    const response = await fetch(`${BASE_URL}getTimesheetForParticular?employeeId=${newId}&startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export const setPausingStatus = async (timesheetId, pauseReason) => {
  try {
    const requestOptions = {
      method: 'POST'
    };

    const response = await fetch(`${BASE_URL}setPausingStatus?timesheetId=${timesheetId}&pausingReason=${pauseReason}`, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export const updateTimesheetDetails = async (jsonData) => {
  const url = `${BASE_URL}updateTimesheetDetails`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error setting timesheet details:', error);
  }
};

export const managePausingDetails = async (timesheetId) => {
  try {
    const response = await fetch(`${BASE_URL}managePausingDetails?timesheetId=${timesheetId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export const fetchRoleActivityData = async () => {
  try {
    const response = await fetch(`${BASE_URL}getRoleActivityDetails`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export async function fetchRoleMap() {
  try {
    const url = `${BASE_URL}getRoleMap`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Error fetching data');
  }
}

export async function downloadTemplate() {
  try {
    const url = `${BASE_URL}downloadTemplate`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'MasterTemplate.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      throw new Error('Failed to download file');
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Error downloading file');
  }
}

export const updateActivityDetails = async (jsonData) => {
  const url = `${BASE_URL}updateActivityDetails`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error setting timesheet details:', error);
  }
};

export const updateActivityFlag = async (id, value) => {
  try {
    const response = await fetch(`${BASE_URL}updateActivityFlag?id=${id}&value=${value}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export async function checkFile() {
  try {
    const url = `${BASE_URL}checkFile`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      alert(data);
      return data;
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Error fetching data');
  }
}

export async function downloadReport() {
  try {
    const url = `${BASE_URL}downloadReport?empId=${empid}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'TimesheetReport.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return 'Success';
    } else {
      return 'Fail';
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Error downloading file');
  }
}

export async function downloadSpecfic(id, startDate, endDate) {
  try {
    const url = `${BASE_URL}downloadTimesheetReport?empId=${id}&startDate=${startDate}&endDate=${endDate}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'TimesheetReport.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return 'Success';
    } else {
      return 'Fail';
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Error downloading file');
  }
}

export async function downloadRangeReport(startDate, endDate) {
  try {
    const url = `${BASE_URL}downloadTimesheetReport?empId=${empid}&startDate=${startDate}&endDate=${endDate}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'TimesheetReport.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return 'Success';
    } else {
      return 'Fail';
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Error downloading file');
  }
}

export const bulkApprovalFunction = async (idArr, value) => {
  try {
    const response = await fetch(`${BASE_URL}setBulkApprovalFunction?idArr=${idArr}&action=${value}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    return data;
  } catch (error) {
    throw new Error('Error fetching timesheet data:', error);
  }
};

export async function reporteesMap(empid) {
  try {
    const url = `${BASE_URL}reporteesMap?employeeId=${empid}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to fetch data');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Error fetching data');
  }
}

export async function bulkDownloadFunction(idArr, startDate, endDate) {
  try {
    const url = `${BASE_URL}bulkDownloadFunction?idArr=${idArr}&startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('download', 'TimesheetReport.zip');

      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return 'Success';
    } else {
      return 'Fail';
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Error downloading file');
  }
}
