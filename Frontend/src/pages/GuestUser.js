import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Grid, Container, Typography, Card, CardContent, Button, Box, Modal,Snackbar, Alert,TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import useToken from '../sections/auth/useToken';
import { style } from './components/ModalStyle';

const GuestUser = () => {
  const { id, authorizedGuestFileId } = useParams();

  const [fileData, setFileData] = useState([]);
  const navigate = useNavigate();
  const { userDetail } = useToken();
  const [open, setOpen] = React.useState(false);
  const [requestType, setRequestType] = useState('');
  const [errorAlert, setErrorAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [reason,setReason]=useState('')

  const handleOpen = () => {
    setReason('')
    setOpen(true)
  };
  const handleClose = () => {
    setOpen(false);
    setRequestType('');
  };

  useEffect(() => {
    loadGuestUserFile();
  }, []);

  const loadGuestUserFile = async () => {
    if (id) {
      const resData = await axios.get(`${process.env.REACT_APP_HOST_URL}/file/view/${id}`, { withCredentials: true });
      const listData = resData && resData.data && resData.data.data && resData.data.data.file;
      setFileData(listData);
    } else {
      const resData = await axios.get(`${process.env.REACT_APP_HOST_URL}/file/view/${authorizedGuestFileId}`, {
        withCredentials: true,
      });
      const listData = resData && resData.data && resData.data.data && resData.data.data.file;
      setFileData(listData);
    }
  };

  const handleDownload = async () => {
    if (id) {
      await window.open(`${process.env.REACT_APP_HOST_URL}/file/download/${id}`);
    } else {
      await window.open(`${process.env.REACT_APP_HOST_URL}/file/download/${authorizedGuestFileId}`);
    }
  };

  const handleGuestBlock = (req) => {
    if (userDetail) {
      setRequestType(req);
      handleOpen();
    } else {
      navigate(`/login/${id}`, { replace: true });
    }
  };
  const handleGuestUnblock = (req) => {
    if (userDetail) {
      setRequestType(req);
      handleOpen();
    } else {
      navigate(`/login/${id}`, { replace: true });
    }
  };

  const handleGuestBlockUnblock = async() => {
    console.log('api will be hitted');
    const headers1 = {
      Authorization: userDetail && userDetail.access_token,
    };
    const reqData = {
      file_id: fileData && fileData.file_id,
      request_type: requestType === 'Block' ? 'Block' : 'Unblock',
      reason: reason || null,
    };
    console.log('guest modal api is hitted',reqData)
    if(!reqData.reason){
      setErrorAlert(true);
      setMessage('Please specify a valid reason');
      
    }else{
      try{
        const res=await axios.post(`${process.env.REACT_APP_HOST_URL}/file/request`,reqData, {
          headers: headers1,
         });
         if (res && res.status === 200) {
          setSuccessAlert(true);
          setMessage(res && res.data && res.data.msg);
          setReason('')
        }
      
      }catch(err){
        console.log(err)
        setErrorAlert(true);
        setMessage(err && err.response && err.response.data && err.response.data.error);
        setReason('')
      }
    }
  

  };
  console.log('id******', id);
  console.log('authorizedGuestFileId******', authorizedGuestFileId);
  return (
    <>
      <Container maxWidth="xl" sx={{ mb: 5 }}>
        <Grid
          item
          xs={12}
          sm={8}
          md={12}
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justify="center"
          style={{ minHeight: '100vh' }}
          sx={{ mt: 15 }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            File Detail
          </Typography>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <h5> Name: </h5>{' '}
                {fileData ? (
                  fileData && fileData.filename
                ) : (
                  <>
                    <CircularProgress />
                  </>
                )}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <h5> Mimetype: </h5>{' '}
                {fileData ? (
                  fileData && fileData.mimetype
                ) : (
                  <>
                    <CircularProgress />
                  </>
                )}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <h5> Size: </h5>{' '}
                {fileData ? (
                  fileData && fileData.size
                ) : (
                  <>
                    <CircularProgress />
                  </>
                )}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <h5> Status: </h5>{' '}
                {fileData ? (
                  fileData && fileData.status
                ) : (
                  <>
                    <CircularProgress />
                  </>
                )}
              </Typography>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <h5> Uploaded On: </h5> {fileData ? fileData && fileData.uploadedOn : null}
              </Typography>
              {fileData && fileData.status === 'Blocked' ? (
                <>
                  <Button onClick={() => handleGuestUnblock('Unblock')} color="error">
                    Unblock
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleDownload} color="error">
                    Download
                  </Button>
                  <Button
                    onClick={() => {
                      handleGuestBlock('Block');
                    }}
                  >
                    {fileData && fileData.status === 'Unblocked' ? 'Block' : 'Unblock'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          {open === true ? (
            <>
              {errorAlert === true ? (
                <>
                  <Snackbar open={errorAlert} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert
                      onClose={() => setErrorAlert(false)}
                      severity="error"
                      sx={{ width: '100%' }}
                      variant="filled"
                    >
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
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box
                  sx={style}
                >
                  <Typography id="modal-modal-title" variant="h6" component="h2">
                   Reason to {requestType}
                  </Typography>
                  <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    <TextField
                      id="filled-basic"
                      label="Reason"
                      variant="filled"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      style={{width:'100%'}}
                    />
                    
                  </Typography>
                  <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleGuestBlockUnblock}>{requestType}</Button>
                </Box>

                
              </Modal>
            </>
          ) : null}
        </Grid>
      </Container>
    </>
  );
};

export default GuestUser;
