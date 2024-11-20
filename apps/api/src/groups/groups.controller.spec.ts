import { Test, TestingModule } from '@nestjs/testing';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import { GroupsController } from './groups.controller';
import GroupsService from './groups.service';
import mockGroupsService from './groups.service.mock';

describe(GroupsController.name, () => {
  let controller: GroupsController;
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: mockGroupsService,
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    service = module.get<GroupsService>(GroupsService);

    jest.spyOn(GroupsService, 'fetchCurrentUser').mockResolvedValue({ preferred_username: 'mockedUser' } as JwtUser);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('searchGroups', () => {
    it('should call searchGroups method of groupsService with correct arguments', async () => {
      const groupName = 'testGroup';
      await controller.searchGroups(groupName);
      expect(service.searchGroups).toHaveBeenCalledWith(groupName);
    });
  });

  describe('fetchCurrentUser', () => {
    it('should call fetchCurrentUser static method of GroupsService with correct arguments', async () => {
      const token = 'mockToken';
      await controller.fetchCurrentUser(token);
      expect(GroupsService.fetchCurrentUser).toHaveBeenCalledWith(token);
    });
  });
});
