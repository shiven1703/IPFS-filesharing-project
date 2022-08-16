import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { useNavigate } from 'react-router-dom';
// material
import { Stack, TextField, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// component
import Iconify from '../../../components/Iconify';
import useToken from '../useToken';

// ----------------------------------------------------------------------

export default function RegisterForm() {
  const navigate = useNavigate();
  const { setToken } = useToken();
  const [errorAlert, setErrorAlert] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('First name required'),
    lastName: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Last name required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

 

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async () => {
      const {firstName,lastName,email,password}=formik.values
                  const requestData={
                                     firstname:firstName,
                                     lastname:lastName,
                                     email,
                                     password,
                                     role:'Normal',
                                     autoLogin:true
                                    }
                  
                    if(!requestData){
                      return
                    }
                
                    try{
                        const responseData = await axios.post(`${process.env.REACT_APP_HOST_URL}/user`,requestData )
                        const userDetail = responseData && responseData.data  && responseData.data.data && responseData.data.data.user ;
                        
                                  if(responseData.data && responseData.status === 201 ) {
                                     setToken(userDetail)
                                     navigate('/dashboard/app', { replace: true })
                                  }else{
                    
                                  navigate('/register', { replace: true })
                                  }
                        }catch(err){
                        console.log(err)
                        setErrorAlert(true)
                        setMessage(err.message)
                        }
    },
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;


  return (
    <FormikProvider value={formik}>

      {errorAlert === true? (<>
          <Snackbar open={errorAlert} 
           anchorOrigin={{vertical: 'top', horizontal: 'right'}}>
            <Alert onClose={ setErrorAlert(false)} severity="error" sx={{ width: '100%' }} variant="filled" >
              {message}
            </Alert>
          </Snackbar>
      </>) : null
      }

      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="First name"
              {...getFieldProps('firstName')}
              error={Boolean(touched.firstName && errors.firstName)}
              helperText={touched.firstName && errors.firstName}
              value={formik.values.firstName}
              onChange={formik.handleChange}
            />

            <TextField
              fullWidth
              label="Last name"
              {...getFieldProps('lastName')}
              error={Boolean(touched.lastName && errors.lastName)}
              helperText={touched.lastName && errors.lastName}
              value={formik.values.lastName}
              onChange={formik.handleChange}
            />
          </Stack>

          <TextField
            fullWidth
            autoComplete="username"
            type="email"
            label="Email address"
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
            value={formik.values.email}
            onChange={formik.handleChange}
          />

          <TextField
            fullWidth
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            {...getFieldProps('password')}
            value={formik.values.password}
            onChange={formik.handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={() => setShowPassword((prev) => !prev)}>
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />

          <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
            Register
          </LoadingButton>
        </Stack>
      </Form>
    </FormikProvider>
  );
}
