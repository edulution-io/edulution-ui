const mockGroupsService = {
  fetchUsers: jest.fn().mockResolvedValue([]),
  fetchGroupByPath: jest.fn().mockResolvedValue({}),
  fetchGroupMembers: jest.fn().mockResolvedValue([]),
  fetchUserById: jest.fn().mockResolvedValue({}),
  searchGroups: jest.fn().mockResolvedValue([]),
};

export default mockGroupsService;
