// This type is based on a third-party object definition from veyon web-API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

type VeyonFeatureRequestArguments = {
  username: string;
  password: string;
  demoAccessToken: string;
  demoServerHost: string;
  applications: string[];
  websiteUrls: string[];
  text: string;
};

type VeyonFeatureRequest = {
  active: boolean;
  arguments?: VeyonFeatureRequestArguments;
};

export default VeyonFeatureRequest;
