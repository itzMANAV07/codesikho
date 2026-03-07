const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
      loginWith: {
        oauth: {
          domain: 'ap-south-1fiv5myrf3.auth.ap-south-1.amazoncognito.com',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: ['https://codesikho-zppi.vercel.app/auth/callback'],
          redirectSignOut: ['https://codesikho-zppi.vercel.app'],
          responseType: 'code',
        },
      },
    },
  },
};

export default awsconfig;