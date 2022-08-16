/* eslint-disable no-nested-ternary */

import { useState, useEffect } from 'react';

// @mui
import { Grid, Container, Typography, Card } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'axios';
import useToken from '../sections/auth/useToken';
import AdminModal from './components/AdminModal';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    field: 'filename',
    headerName: 'File name',
    width: 400,
    editable: true,
    renderCell: (params) => <>{params && params.row && params.row.file_details && params.row.file_details.filename}</>,
  },
  {
    field: 'firstname',
    headerName: 'Author',
    width: 150,
    editable: true,
    renderCell: (params) => <>{params && params.row && params.row.user_details && params.row.user_details.firstname}</>,
  },
  {
    field: 'type',
    headerName: 'Type',
    width: 150,
    editable: true,
  },
  {
    field: 'approvalStatus',
    headerName: 'Status',
    width: 150,
    editable: true,
    renderCell: (params) => (
      <>
        {params && params.row && params.row.approvalStatus === -1 ? (
          <>Pending</>
        ) : // eslint-disable-next-line no-nested-ternary
        params && params.row && params.row.approvalStatus === 1 ? (
          <>Approved</>
        ) : params && params.row && params.row.approvalStatus === 0 ? (
          <>Rejected</>
        ) : null}
      </>
    ),
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

const ListRequest = () => {
  const { userDetail } = useToken();
  const [requestList, setRequestList] = useState();
  const [open, setOpen] = useState(false);
  const [pageSize, setPageSize] = useState(7);
  const [selection, setSelection] = useState([]);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    loadAllRequest();
  };

  useEffect(() => {
    loadAllRequest();
  }, []);

  const loadAllRequest = async () => {
    const headers1 = {
      Authorization: userDetail && userDetail.access_token,
    };
    const resData = await axios.get(`${process.env.REACT_APP_HOST_URL}/admin/requests`, { headers: headers1 });
    const listData = resData && resData.data && resData.data.data && resData.data.data.requests;

    let id = 1;
    listData.forEach((object) => {
      // eslint-disable-next-line no-plusplus
      object.id = id++;
    });
    setRequestList(listData);
  };

  const handleSelection = (ids) => {
    const selectedIDs = new Set(ids);
    const selectedRowData = requestList && requestList.filter((row) => selectedIDs.has(row.id));
    setSelection(selectedRowData);
    handleOpen();
  };
  
  return (
    <>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          List of requests
        </Typography>

        <Grid item xs={12} sm={8} md={12}>
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={requestList && requestList.length? requestList : ""}
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
                  <AdminModal open={open} handleOpen={handleOpen} handleClose={handleClose} item={selection[0]} />
                ) : null}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </>
  );
};

export default ListRequest;
