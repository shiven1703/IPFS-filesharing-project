/* eslint-disable no-nested-ternary */
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
  const { requestType, item,user } = props;

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleRequestProcessing = async () => {
    
     try {
       const headers1 = {
         Authorization: userDetail && userDetail.access_token,
       };
       const reqData = {
         request_id: item && item.request_id,
         operation: requestType === 'Accept' ? 'Approve' : 'Decline',
       
       };
       if(!reqData.request_id ||  !reqData.operation ){
         return
       }
       const blockResponse = await axios.post(`${process.env.REACT_APP_HOST_URL}/admin/request/process`, reqData, {
         headers: headers1,
       });
     
       if (blockResponse && blockResponse.status === 200) {
         setSuccessAlert(true);
         setMessage(blockResponse && blockResponse.data && blockResponse.data.msg);
         handleClose();
       }
     } catch (err) {
       setErrorAlert(true);
       setMessage(err && err.response && err.response.data && err.response.data.error);
       handleClose();
     }
  };

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

      <Button onClick={handleOpen}>{requestType}</Button>
      <Modal
        hideBackdrop
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 350 }}>
          <h5 id="child-modal-title">Are you sure you want to {requestType} ? </h5>
          <Box
            component="form"
            sx={{
              '& > :not(style)': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
          />
             
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleRequestProcessing}>{requestType}</Button>
        </Box>
      </Modal>
    </>
  );
};

const AdminModal = ({ open, handleOpen, handleClose, item }) => {
  const { userDetail } = useToken();
  const [metadata, setMetadata] = useState(item);

  return (
    <div>
      
        {!metadata ? (
          <>
          {/* <Box sx={style}>
            <CircularProgress />
          </Box> */}
          </>
        ) : (
          <>
          <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Request Detail
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> Status : </h5> 
                
        <>
        {metadata && metadata.approvalStatus === -1 ? 
        (<>Pending</>)
         : // eslint-disable-next-line no-nested-ternary
        metadata && metadata.approvalStatus === 1 ? (
          <>Approved</>
        ) : metadata && metadata.approvalStatus === 0 ? (
          <>Rejected</>
        ) : null}
       </>
                
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5> File Name : </h5> {metadata && metadata.file_details &&  metadata.file_details.filename}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>File  Type : </h5> {metadata &&  metadata.file_details &&  metadata.file_details.mimetype}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>File  Size : </h5> {metadata &&  metadata.file_details &&  metadata.file_details.size}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>Uploaded On : </h5> {metadata &&  metadata.file_details &&  metadata.file_details.uploadedOn}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>Last Downloaded On : </h5> {metadata &&  metadata.file_details &&  metadata.file_details.uploadedOn}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>Request Type: </h5> {metadata && metadata.type}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>Reason: </h5> {metadata && metadata.reason}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>Author: </h5> {metadata && metadata.user_details && metadata.user_details.firstname}
              </Typography>
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                <h5>Contact Author: </h5> {metadata && metadata.user_details && metadata.user_details.email}
              </Typography>


               <Typography id="modal-modal-description" sx={{ mt: 2 }}>
               
                {metadata && metadata.approvalStatus === -1 ? (
                  <>
                    <ChildModal requestType="Accept" item={metadata} />
                    <ChildModal requestType="Reject" item={metadata} />
                  </>
                ) : metadata && metadata.approvalStatus === 1 ? (
                  <>
                    <ChildModal requestType="Reject" item={metadata} />
                  </>
                ):metadata && metadata.approvalStatus === 0?
                (  <>
                    <ChildModal requestType="Accept" item={metadata} />
                  </>):null
                }
              </Typography> 
            </Box>
            </Modal>
          </>
        )} 
 
    </div>
  );
};

export default AdminModal;
