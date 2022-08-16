import * as Yup from 'yup';
import { useState } from 'react';
import { Link as RouterLink, useNavigate,useParams } from 'react-router-dom';
import { useFormik, Form, FormikProvider, ErrorMessage } from 'formik';
import axios from 'axios';

// material
import {
  Link,
  Stack,
  Checkbox,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FormGroup from '@mui/material/FormGroup';

// component
import Iconify from '../../../components/Iconify';

import useToken from '../useToken';
// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();
  const { setToken } = useToken();
  const [showPassword, setShowPassword] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const { guestFileId } = useParams();
  

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async () => {
      const loginRequestData = formik && formik.values;
      
      if (!loginRequestData) {
        return;
      }

      if (user === 'Admin') {
        
        // Super Admin
        // Email: admin@gmail.com
        // Password: 159357
        try {
          const responseData = await axios.post(`${process.env.REACT_APP_HOST_URL}/admin/login`, loginRequestData);
          
          if (responseData && responseData.status === 200) {
            const userDetail =
              responseData && responseData.data && responseData.data.data && responseData.data.data.user;
            setToken(userDetail);
            navigate('/dashboard/app', { replace: true });
          }
        } catch (err) {
          console.log('err', err);
          setErrorAlert(true);
          setMessage(err && err.response && err.response.data && err.response.data.error || err.message);
        }
      } else {
        try {
          const responseData = await axios.post(`${process.env.REACT_APP_HOST_URL}/user/login`, loginRequestData);
          
          if (responseData && responseData.status === 200) {
            const userDetail =
              responseData && responseData.data && responseData.data.data && responseData.data.data.user;
            setToken(userDetail);
            if(guestFileId){
              
              navigate(`/dashboard/authorizedGuest/${guestFileId}`, { replace: true });
            }else{
              navigate('/dashboard/app', { replace: true });
            }
            
          }
        } catch (err) {
          console.log('err', err);
          setErrorAlert(true);
          setMessage(err && err.response && err.response.data && err.response.data.error || err.message);
        }
      }
    },
  });

  const { errors, touched, values, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleCheckbox = (event, isChecked) => {
    
    if (isChecked === true) {
      setUser('Admin');
    }
  };

  return (
    <>
      <FormikProvider value={formik}>
        {errorAlert === true ? (
          <>
            <Snackbar open={errorAlert} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Alert onClose={() => setErrorAlert(false)} severity="error" sx={{ width: '100%' }} variant="filled">
                {message}
              </Alert>
            </Snackbar>
          </>
        ) : null}

        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              autoComplete="username"
              type="email"
              label="Email address"
              {...getFieldProps('email')}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email && errors.email}
            />

            <TextField
              fullWidth
              autoComplete="current-password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              {...getFieldProps('password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleShowPassword} edge="end">
                      <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={Boolean(touched.password && errors.password)}
              helperText={touched.password && errors.password}
            />
          </Stack>

          <FormGroup>
            <FormControlLabel control={<Checkbox />} label="Login as an Admin" onChange={handleCheckbox} />
          </FormGroup>
          <br />
          <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
            Login
          </LoadingButton>
        </Form>
      </FormikProvider>
    </>
  );
}
