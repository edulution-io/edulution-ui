const mockAppConfigService = {
  insertConfig: jest.fn().mockResolvedValue(undefined),
  updateConfig: jest.fn().mockResolvedValue(undefined),
  getAppConfigs: jest.fn().mockResolvedValue([]),
  deleteConfig: jest.fn().mockResolvedValue(undefined),
  getAppConfigByName: jest.fn().mockResolvedValue({
    options: {
      url: 'https://example.com/api/',
      apiKey: 'secret-key',
    },
  }),
};

export default mockAppConfigService;
