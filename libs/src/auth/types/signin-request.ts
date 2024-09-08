type SigninRequest = {
  client_id?: string;
  client_secret?: string;

  grant_type?: string;
  scope?: string;

  username: string;
  password: string;
};

export default SigninRequest;
