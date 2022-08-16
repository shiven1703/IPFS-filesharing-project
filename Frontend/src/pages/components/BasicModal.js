import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import { Snackbar, Alert } from '@mui/material';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import useToken from '../../sections/auth/useToken';
import ClipboardCopy from './Clipboard';
import { style } from './ModalStyle';

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: 400,
//   bgcolor: 'background.paper',
//   border: '2px solid #000',
//   boxShadow: 24,
//   pt: 2,
//   px: 4,
//   pb: 3,
// };
const ChildModal = (props) => {
  const { userDetail } = useToken();
  const [open, setOpen] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [reason,setReason]=useState('')
  const { requestType, item } = props;

  const handleOpen = () => {
   
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setReason('');
  };
  const headers1 = {
    Authorization: userDetail && userDetail.access_token,
  };
  const handleBlockUnBlockRequest = async () => {
    
    try {
   
      const reqData = {
        file_id: item && item.file_id,
        request_type: requestType === 'block' ? 'Block' : 'Unblock',
        reason: reason || null,
      };
      if(!reqData.file_id ||  !reqData.request_type|| !reqData.reason){
        setErrorAlert(true);
        setMessage('Please specify a reason');
        handleClose();
        return
      }
      const blockResponse = await axios.post(`${process.env.REACT_APP_HOST_URL}/file/request`, reqData, {
        headers: headers1,
      });
     
      if (blockResponse && blockResponse.status === 200) {
        setSuccessAlert(true);
        setMessage(blockResponse && blockResponse.data && blockResponse.data.msg);
        handleClose();
        setReason('');
      }
    } catch (err) { 
      setErrorAlert(true);
      setMessage(err && err.response && err.response.data && err.response.data.error);
      handleClose();
      setReason('');
    }
  };

  const handleDelete=async()=>{
    
    try { 
      const reqData = {
        file_id: item && item.file_id,
      };
      
      if(!reqData.file_id){
        return
      }
      const deleteResponse = await axios.delete(`${process.env.REACT_APP_HOST_URL}/user/file/${reqData && reqData.file_id}`, 
      { 
      headers: headers1,
      data: reqData
      });
     
      if (deleteResponse && deleteResponse.status === 200) {
        setSuccessAlert(true);
        setMessage(deleteResponse && deleteResponse.data && deleteResponse.data.msg);
        handleClose();
      }
    } catch (err) {
  
      setErrorAlert(true);
      setMessage(err && err.response && err.response.data && err.response.data.error);
      handleClose();
    }
  }
  return (
 <>
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
            <Alert onClose={() => setSuccessAlert(false)} severity="success" sx={{ width: '100%' }} variant="filled">
              {message}
            </Alert>
          </Snackbar>
        </>
      ) : null}

      <Button onClick={handleOpen}>{requestType==='delete'? `${requestType} File`  : `${requestType} Request` } </Button>
      <Modal
        hideBackdrop
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 350 }}>
          <h4 id="child-modal-title">
          {requestType === 'delete' ? 
          (<>Are you sure you want to delete it? </>):
          (<>Reason</>) }
          </h4>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          >
            {requestType === 'delete' ? null :
           ( <TextField id="filled-basic" label="Reason" variant="filled" value={reason} onChange={(e)=>setReason(e.target.value)} />)
            }
          </Box>
          <Button onClick={handleClose}>Cancel</Button>
          {requestType==='delete'? (<>
            <Button onClick={handleDelete}>{requestType}</Button>
          </>):(<>
            <Button onClick={handleBlockUnBlockRequest}>{requestType}</Button>
          </>)}

        </Box>
      </Modal>
  </>
  );
};

const BasicModal = ({ open, handleOpen, handleClose, item }) => {
  const { userDetail } = useToken();
  const [metadata, setMetadata] = useState({});
  const [deleteFile,setDeleteFile] = useState(true)
  const [line,setLine] = useState('')

  useEffect(() => {
    const itemLength = item && item.downloadUrl && item.downloadUrl.length;
    const line = item && item.downloadUrl && item.downloadUrl.slice(-20);
    setLine(line)
    loadMetaData();
  }, []);

  const loadMetaData = async () => {

    // NOTE:{ params: { isAuthrozed: false } }

    const resData = await axios.get(`${item && item.downloadUrl}`, {
      withCredentials: true,
    });
    const fileMetadata = resData && resData.data && resData.data.data && resData.data.data.file;

    setMetadata(fileMetadata);
  };

  const handleDownload = async () => {
    
      await window.open(`${process.env.REACT_APP_HOST_URL}/file/download/${line}`);    
  };

  
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {!metadata && !metadata.length? (
          <>
            <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
            <CircularProgress />
            </Typography>
            </Box>
          </>
        ) : (
          <>
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                File Detail
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> Name : </h5> {metadata ? metadata && metadata.filename : (<><CircularProgress /></>)}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> Mimetype : </h5> {metadata ? metadata && metadata.mimetype : (<><CircularProgress /></>)}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> Size : </h5> {metadata ? metadata && metadata.size :(<><CircularProgress /></>)}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> Uploaded On : </h5> {metadata ? metadata && metadata.uploadedOn : (<><CircularProgress /></>)}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> Status: </h5> {metadata ? metadata  && metadata.status : (<><CircularProgress /></>)}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> Download URL: </h5> {item ?
                (<>
                  <ClipboardCopy copyText= {`http://localhost:3000/requests/${line}`}/>
                </>)
               
                : (<><CircularProgress /></>)}
              </Typography>

              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
           

                <Button onClick={handleDownload}>Download</Button>
                {metadata && metadata.status === 'Unblocked' ? (
                  <>
                    <ChildModal requestType="block" item={metadata} />
                  </>
                ) : (
                  <>
                    <ChildModal requestType="unblock" item={metadata} />
                  </>
                )}
               
                 {deleteFile===true ? 
                  (<>
                    <ChildModal requestType="delete" item={metadata} />
                  </>): 
                null} 
              </Typography>
            </Box>
          </>
        )}
      </Modal>
    </div>
  );
};

export default BasicModal;
