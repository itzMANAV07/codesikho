const awsConfig = {
  Auth: {
    Cognito: {
      region: "ap-south-1",
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
    }
  }
};

export default awsConfig;