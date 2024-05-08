import React, { useEffect, lazy } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';
import ErrorPage from 'pages/extra-pages/ErrorPage';
import { setSessionEmpId } from 'apifunctionality/apicalling';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));
const ActivityManage = Loadable(lazy(() => import('pages/activity-manager')));

const SetSessionStorage = () => {
  const navigate = useNavigate();
  const { empid, empname, empmailid } = useParams();

  useEffect(() => {
    setSessionEmpId(empid);
    localStorage.setItem('empId', empid);
    localStorage.setItem('empName', empname);
    localStorage.setItem('empMailId', empmailid);

    navigate('/timesheet');
  }, [empid, empname, empmailid, navigate]);

  return null;
};

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/empid/:empid/empname/:empname/empmailid/:empmailid',
      element: <SetSessionStorage />
    },
    {
      path: '/timesheet',
      element: <DashboardDefault />
    },
    {
      path: '/activity-manager',
      element: <ActivityManage />
    }
  ]
};

const UnauthorizedRoute = {
  path: '/unauthorized',
  element: <ErrorPage />
};

export { MainRoutes, UnauthorizedRoute };
