import { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
// @mui
import { Grid, Container, Typography, Card, Snackbar, Alert, Box } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { Formik } from 'formik';
import LinearProgress from '@mui/material/LinearProgress';
import axios from 'axios';
import useToken from '../sections/auth/useToken';

const UploadFile = () => {
  const { userDetail } = useToken();
  const [errorAlert, setErrorAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [download, setDownload] = useState('');
  const [uploadLoader,setUploadLoader]=useState(false)
  const navigate = useNavigate();

  useEffect(()=>{
    if(!userDetail){
      navigate('/login', { replace: true });
    }
  },[])


  const handleUpload = async (values) => {
    // eslint-disable-next-line prefer-const
    let Data = values && values.file;

    if (!Data) {
      setErrorAlert(true);
      setMessage('Please upload file here');
      return;
    // eslint-disable-next-line no-else-return
    } 

      let shouldSkip = false;
      // 10 MB = 10485760 Bytes (in binary)
      Object.keys(Data).forEach((key) => {
        if (shouldSkip) {
          return;
        }
        if (Data[key] && Data[key].size > 10485760) {
          setErrorAlert(true);
          setMessage('file size is more than allowed limit')
          shouldSkip = true;
          // eslint-disable-next-line no-useless-return
          return;
        }
      });
    

      const uploadData = new FormData();
      Object.keys(Data).forEach((key) => {
        uploadData.append('files', Data[key]);
      });

      // data send to the server

      try {
        const headers1 = {
          Authorization: userDetail && userDetail.access_token,
        };
        setUploadLoader(true)
        const responseData = await axios.post(`${process.env.REACT_APP_HOST_URL}/file/upload`, uploadData, {
          headers: headers1,
        });

        if (responseData.status === 200) {
          setUploadLoader(false)
          setDownload(responseData && responseData.data && responseData.data.data && responseData.data.data.file);
          setSuccessAlert(true);
          setMessage(responseData && responseData.data && responseData.data.msg);
          navigate('/dashboard/list', { replace: true });
        }
      } catch (err) {
        console.log('err', err);
        setUploadLoader(false)
        setErrorAlert(true);
        setMessage(err && err.response && err.response.data && err.response.data.error);
        if(err && err.message === "Network Error"){
          navigate('/login', { replace: true });
        }
      }
  };


  return (
    <>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          File Upload
        </Typography>

        <Grid item xs={12} sm={8} md={12}>
          {errorAlert === true ? (
            <>
              <Snackbar open={errorAlert} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={() => setErrorAlert(false)} severity="error" sx={{ width: '100%' }} variant="filled">
                  {message}
                </Alert>
              </Snackbar>
            </>
          ) : null}
          {successAlert === true ? (
            <>
              <Snackbar open={successAlert} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert
                  onClose={() => setSuccessAlert(false)}
                  severity="success"
                  sx={{ width: '100%' }}
                  variant="filled"
                >
                  {message}
                </Alert>
              </Snackbar>
            </>
          ) : null}

          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Select the file which you may want to upload
              </Typography>
              <Formik
                initialValues={{ file: '' }}
                onSubmit={async (values) => {     
                 await handleUpload(values);
             
                }}
              >
                {(formProps) => (
                  <form onSubmit={formProps.handleSubmit}>
                    <input
                      onChange={(e) => formProps.setFieldValue('file', e.target.files)}
                      id="file"
                      multiple
                      type="file"
                    />
                    <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 5 }}>
                      {uploadLoader ? (
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress color='inherit'/>
                        </Box>
                        ) : (<>Upload</>)}
                    </Button>
                  </form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </>
  );
};

export default UploadFile;
