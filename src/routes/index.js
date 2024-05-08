import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

import LoginRoutes from './LoginRoutes';
import { MainRoutes, UnauthorizedRoute } from './MainRoutes';

export default function ThemeRoutes() {
  useEffect(() => {
    document.body.style.zoom = '90%';
  }, []);
  return useRoutes([MainRoutes, UnauthorizedRoute, LoginRoutes]);
}
