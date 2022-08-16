/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable no-plusplus */

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

import axios from 'axios';
import {  useNavigate } from 'react-router-dom';
import useToken from '../sections/auth/useToken';
import BasicModal from './components/BasicModal';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'filename',
    headerName: 'File name',
    width: 500,
    editable: true,
  },
  {
    field: 'uploadedOn',
    headerName: 'Upload Date',
    width: 300,
    editable: true,
  },
  {
    width: 120,
    field: 'viewField',
    headerName: 'View',
    sortable: false,
    renderCell: (params) => (
      <>
        <Button variant="contained" color="primary">
          View
        </Button>
      </>
    ),
  },
];

const ListFile = () => {
  const { userDetail } = useToken();
  const [allFile, setAllFile] = useState();
  const [open, setOpen] = useState(false);
  const [pageSize, setPageSize] = useState(7);
  const [selection, setSelection] = useState([]);
  const navigate = useNavigate();

   useEffect(()=>{
     if(!userDetail){
       navigate('/login', { replace: true });
     }
   },[])


  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    window.location.reload();
  };

  useEffect(() => {
    loadAllFileDetail();
  }, []);

  const loadAllFileDetail = async () => {
    const headers1 = {
      Authorization: userDetail && userDetail.access_token,
    };
    const fileMetaData = await axios.get(`${process.env.REACT_APP_HOST_URL}/user/files`, { headers: headers1 });
    const fileMetaDataDetail =
      fileMetaData && fileMetaData.data && fileMetaData.data.data && fileMetaData.data.data.files;

    let id = 1;
    fileMetaDataDetail.forEach((object) => {
      object.id = id++;
    });

    setAllFile(fileMetaDataDetail);
  };

  console.log('allfile', allFile);

  const handleSelection = (ids) => {
    const selectedIDs = new Set(ids);
    const selectedRowData = allFile && allFile.filter((row) => selectedIDs.has(row.id));
    setSelection(selectedRowData);
    handleOpen();
  };
  useEffect(() => {
    console.log('selection and api will be called now', selection);
  }, [selection]);

  return (
    <>
      <Box sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={
            allFile && allFile.length ? (
              allFile
            ) : ""
          }
          columns={columns}
          pageSize={pageSize}
          rowsPerPageOptions={[7, 10, 25, 50, 100]}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onSelectionModelChange={(ids) => {
            handleSelection(ids);
          }}
        />
      </Box>
      {open === true ? (
        <BasicModal open={open} handleOpen={handleOpen} handleClose={handleClose} item={selection[0]} />
      ) : null}
    </>
  );
};

export default ListFile;
