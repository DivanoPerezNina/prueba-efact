export const environment = {
  production: false,
  api: {
    oauthToken: '/efact-api/api-efact-ose/oauth/token',
    pdf: '/efact-api/api-efact-ose/v1/pdf/',
    xml: '/efact-api/api-efact-ose/v1/xml/',
    cdr: '/efact-api/api-efact-ose/v1/cdr/'
  },
  basicAuthHeader: 'Basic Y2xpZW50OnNlY3JldA==',
  sampleCredentials: {
    username: '20111193035',
    password: '61a77b6fda77c3a2d6b28930546c86d7f749ccf0bd4bad1e1192f13bb59f0f30'
  },
  defaultTicket: '571cc3a3-5b1f-4855-af26-0de6e7c5475f'
};
