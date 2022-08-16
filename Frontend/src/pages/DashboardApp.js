// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';
// components
import { useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import Page from '../components/Page';
import useToken from '../sections/auth/useToken';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  const theme = useTheme();
  const { userDetail } = useToken();
  const navigate = useNavigate();
 
  useEffect(()=>{
    if(!userDetail){
      navigate('/login', { replace: true });
    }
  },[])
  return (
    <Page title="Dashboard">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back,
          {userDetail && userDetail.role === 'Admin' ? (
            <>{userDetail && userDetail.firstname}</>
          ) : (
            <>
              {userDetail && userDetail.firstname} {userDetail && userDetail.lastname}{' '}
            </>
          )}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={12}>
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                {userDetail && userDetail.role === 'Admin' ? (
                  <>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      Admin have special rights in our Online File Sharing Platform. After viewing the request list of
                      Block/Unblock of files, you can proceed further
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      Welcome to the Online File Sharing Platform. On this platform You can Upload the file and later on
                      you can download the files. <br />
                      On left navigation menu you can see two options: <br />
                      <br />
                      1) File upload : from here you can upload the files <br />
                      2) File download : here you can see the list of all uploaded files.you can view the particular
                      file by clicking on view button. Here you will find options for download the file and a request of
                      block/unblock of file download to admin.
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
