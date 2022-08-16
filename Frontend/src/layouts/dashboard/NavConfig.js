// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const getIcon = (name) => <Iconify icon={name} width={22} height={22} />;

const navConfig = [

  {
    title: 'File Upload',
    path: '/dashboard/upload',
    icon: getIcon('mdi:upload'),
  },
  {
    title: 'File Download',
    path: '/dashboard/list',
    icon: getIcon('clarity:list-solid-badged'),
  }
];

export default navConfig;

export const adminNavConfig = [

  {
    title: 'Request List',
    path: '/dashboard/requests',
    icon: getIcon('bi:card-list'),
  },
  
];
