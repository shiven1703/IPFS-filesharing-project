import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';

import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import DashboardApp from './pages/DashboardApp';
import UploadFile from './pages/UploadFile';
import ListFile from './pages/ListFile';

import ListRequest from './pages/ListRequest';
import GuestUser from './pages/GuestUser';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { path: 'app', element: <DashboardApp /> },
        { path: 'authorizedGuest/:authorizedGuestFileId', element: <GuestUser /> },
        { path: 'upload', element: <UploadFile /> },
        { path: 'list', element: <ListFile /> },
        { path: 'requests', element: <ListRequest /> },
       
      ],
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '/', element: <Navigate to="/dashboard/app" /> },
        { path: 'login', element: <Login /> },
        { path: 'login/:guestFileId', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
        { path: 'requests/:id', element: <GuestUser /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
