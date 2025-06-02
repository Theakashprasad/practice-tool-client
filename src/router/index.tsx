import { createBrowserRouter, Navigate } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';
import StaffManagement from '../pages/Apps/StaffManagement';
import ClientDatabase from '../pages/Apps/ClientDatabase';

const finalRoutes = routes.map((route) => {
    return {
        ...route,
        element: route.layout === 'blank' ? <BlankLayout>{route.element}</BlankLayout> : <DefaultLayout>{route.element}</DefaultLayout>,
    };
});

finalRoutes.push({
    path: 'apps/staff-management',
    element: <DefaultLayout><StaffManagement /></DefaultLayout>,
});

finalRoutes.push({
    path: 'apps/client-database',
    element: <DefaultLayout><ClientDatabase /></DefaultLayout>,
});

// Add a catch-all route that redirects to the home page
finalRoutes.push({
    path: '*',
    element: <Navigate to="/" replace />,
});

const router = createBrowserRouter(finalRoutes, {
    basename: '/', // This ensures the router works with the root path
});

export default router;
