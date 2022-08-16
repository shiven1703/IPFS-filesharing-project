import { useState } from 'react';

export default function useToken() {
  const getToken = () => {
    const tokenString = localStorage.getItem('tokenDetail');
    const userToken = JSON.parse(tokenString);
    return userToken
  };

  const [userDetail, setToken] = useState(getToken());

  const saveToken = userToken => {
    localStorage.setItem('tokenDetail', JSON.stringify(userToken));
    setToken(userToken.access_token);
  };

  return {
    setToken: saveToken,
    userDetail
  }
}