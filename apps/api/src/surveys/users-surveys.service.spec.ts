// import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import UsersSurveysService from './users-surveys.service';
import { User /* , UserDocument */ } from '../users/user.schema';
import {
  answeredSurvey,
  answeredSurveyIds,
  createdSurvey,
  createdSurveys,
  distributedSurvey,
  first_username,
  mocked_participants,
  // mocked_participants,
  mockedAnswer,
  openSurvey,
  openSurveys,
  second_username,
  unknownSurvey,
  Users_UserSurveys_afterAddAnswer_openSurvey,
  Users_UserSurveys_afterAddCreated_unknownSurvey,
  Users_UserSurveys_afterAddOpen_unknownSurvey,
  // Users_UserSurveys_afterAddCreated_unknownSurvey,
  // Users_UserSurveys_afterAddOpen_unknownSurvey,
  Users_UserSurveys_afterRemove_answeredSurvey,
  Users_UserSurveys_afterRemove_createdSurvey,
  Users_UserSurveys_afterRemove_distributedSurvey,
  Users_UserSurveys_afterRemove_openSurvey,
  userSurveys,
} from './users-surveys.service.mock';

describe('UsersSurveysService', () => {
  let service: UsersSurveysService;
  // let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersSurveysService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn((name: string) => {
              switch (name) {
                case first_username:
                  return { username: first_username, usersSurveys: userSurveys};
                case second_username:
                  return { username: second_username, usersSurveys: userSurveys};
                default:
                  return { exec: jest.fn().mockResolvedValue({ username: first_username, usersSurveys: userSurveys}) };
              }
            }),
            // findOne: jest.fn().mockReturnValue({
            //   exec: jest.fn().mockResolvedValue({ username: first_username, usersSurveys: userSurveys})
            // }),
            findOneAndUpdate: jest.fn((name: string, updateUserDto: any) => {
              switch (name) {
                case first_username:
                  return updateUserDto;
                case second_username:
                  return updateUserDto;
                default:
                  return { exec: jest.fn().mockResolvedValue({ username: first_username, usersSurveys: userSurveys}) };
              }
            }),
            //findOneAndUpdate:  jest.fn().mockReturnValue({
            //   exec: jest.fn().mockResolvedValue({ username: first_username, usersSurveys: userSurveys}),
            // }),
            // find: jest.fn((name: string, updateUserDto: any) => {
            //   switch (name) {
            //     case first_username:
            //       return updateUserDto;
            //     case second_username:
            //       return updateUserDto;
            //     default:
            //       throw new Error('User not found');
            //   }
            // }),
            find: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([
                {username: first_username, usersSurveys: userSurveys},
                {username: second_username, usersSurveys: userSurveys}
              ]),
            }),
            // exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersSurveysService>(UsersSurveysService);
  });


  describe('updateUser', () => {
    it('should update a user', async () => {
      const result = await service.updateUser(first_username, {usersSurveys: userSurveys});
      expect(result).toStrictEqual({username: first_username, usersSurveys: userSurveys});
    });
  });


  describe('getExistingUser', () => {
    it('should return a user', async () => {
      const result = await service.getExistingUser(first_username);
      expect(result).toStrictEqual({ username: first_username, usersSurveys: userSurveys });
    });

    it('should throw an error if the user is not found', async () => {
      const asyncMock = jest.fn(() => { throw new Error('User not found') });
      expect(await asyncMock()).toThrow(new Error('User not found'));

      // jest.spyOn(service, 'getExistingUser').mock(new Error('User not found'));
      // expect(await service.getExistingUser('first_username')).toThrow(new Error('User not found'));
    });
  });


  describe('getOpenSurveyIds', () => {
    it('should return open survey ids', async () => {
      jest.spyOn(service, 'getExistingUser').mockResolvedValueOnce({ username: first_username, usersSurveys: userSurveys});
      const result = await service.getOpenSurveyIds(first_username);
      expect(result).toEqual(openSurveys);
    });
  });


  describe('getCreatedSurveyIds', () => {
    it('should return open survey ids', async () => {
      jest.spyOn(service, 'getExistingUser').mockResolvedValueOnce({ username: first_username, usersSurveys: userSurveys});
      const result = await service.getCreatedSurveyIds(first_username);
      expect(result).toEqual(createdSurveys);
    });
  });


  describe('getAnsweredSurveyIds', () => {
    it('should return open survey ids', async () => {
      jest.spyOn(service, 'getExistingUser').mockResolvedValueOnce({ username: first_username, usersSurveys: userSurveys});
      const result = await service.getAnsweredSurveyIds(first_username);
      expect(result).toEqual(answeredSurveyIds);
    });
  });


  describe('onRemoveSurvey', () => {
    it('should remove survey from list of openSurveys if survey gets deleted and is open', async () => {
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: first_username, usersSurveys: Users_UserSurveys_afterRemove_openSurvey});
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: second_username, usersSurveys: Users_UserSurveys_afterRemove_openSurvey});

      await service.onRemoveSurvey(openSurvey);

      expect(service.updateUser).toHaveBeenCalledWith(first_username, {username: first_username, usersSurveys: userSurveys});
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {username: second_username, usersSurveys: userSurveys});
    });

    it('should remove survey from list of createdSurveys if survey gets deleted and is in the created list', async () => {
      // jest.spyOn(userModel, 'find').mockResolvedValueOnce([
      //   {username: first_username, usersSurveys: userSurveys},
      //   {username: second_username, usersSurveys: userSurveys}
      // ]);
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: first_username, usersSurveys: Users_UserSurveys_afterRemove_createdSurvey});
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: second_username, usersSurveys: Users_UserSurveys_afterRemove_createdSurvey});

      await service.onRemoveSurvey(createdSurvey);

      expect(service.updateUser).toHaveBeenCalledWith(first_username, {usersSurveys: Users_UserSurveys_afterRemove_createdSurvey});
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {usersSurveys: Users_UserSurveys_afterRemove_createdSurvey});
    });

    it('should remove survey from list of answeredSurveys if survey gets deleted was already answered', async () => {
      // jest.spyOn(userModel, 'find').mockResolvedValueOnce([
      //   {username: first_username, usersSurveys: userSurveys},
      //   {username: second_username, usersSurveys: userSurveys}
      // ]);
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: first_username, usersSurveys: Users_UserSurveys_afterRemove_answeredSurvey});
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: second_username, usersSurveys: Users_UserSurveys_afterRemove_answeredSurvey});

      await service.onRemoveSurvey(answeredSurvey);

      expect(service.updateUser).toHaveBeenCalledWith(first_username, {usersSurveys: Users_UserSurveys_afterRemove_answeredSurvey});
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {usersSurveys: Users_UserSurveys_afterRemove_answeredSurvey});
    });

    it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: first_username, usersSurveys: Users_UserSurveys_afterRemove_distributedSurvey});
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: second_username, usersSurveys: Users_UserSurveys_afterRemove_distributedSurvey});

      await service.onRemoveSurvey(distributedSurvey);

      expect(service.updateUser).toHaveBeenCalledWith(first_username, {usersSurveys: Users_UserSurveys_afterRemove_distributedSurvey});
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {usersSurveys: Users_UserSurveys_afterRemove_distributedSurvey});
    });

    it('should not remove any surveyId if the deleted id is not included in any of the lists', async () => {
      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurvey(unknownSurvey);

      expect(service.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not found', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(service, 'getExistingUser').mockRejectedValueOnce(new Error('User not found'));
      await expect(service.onRemoveSurvey(unknownSurvey)).rejects.toThrow('User not found');
    });
  });


  describe('addAnswer', () => {
    it('should add a survey to open surveys', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({username: first_username, usersSurveys: userSurveys});
      jest.spyOn(service, 'getExistingUser').mockResolvedValueOnce({username: first_username, usersSurveys: userSurveys});
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce({username: first_username, usersSurveys: Users_UserSurveys_afterAddAnswer_openSurvey});
      await service.addAnswer(first_username, openSurvey, mockedAnswer, false);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {username: first_username, usersSurveys: Users_UserSurveys_afterAddAnswer_openSurvey});
    });

    it('should throw an error if the user is not found', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(service, 'getExistingUser').mockRejectedValueOnce(new Error('User not found'));
      await expect(service.addToOpenSurveys(first_username, 2)).rejects.toThrow('User not found');
    });
  });


  describe('getCommitedAnswer', () => {
    it('should return the previously commited answer for the survey with props.surveyId from user with props.username', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({username: first_username, usersSurveys: userSurveys});
      jest.spyOn(service, 'getExistingUser').mockResolvedValueOnce({username: first_username, usersSurveys: userSurveys});
      await service.getCommitedAnswer(first_username, openSurvey);
      expect(service.getCommitedAnswer).toHaveReturnedWith(mockedAnswer);
    });

    it('should throw an error if the user is not found', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(service, 'getExistingUser').mockRejectedValueOnce(new Error('User not found'));
      await expect(service.addToOpenSurveys(first_username, 0)).rejects.toThrow('User not found');
    });
  });


  describe('addToCreatedSurveys', () => {
    it('should add a survey to open surveys', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({username: first_username, usersSurveys: userSurveys});
      jest.spyOn(service, 'getExistingUser').mockResolvedValueOnce( { username: first_username, usersSurveys: userSurveys });
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce( { username: first_username, usersSurveys: Users_UserSurveys_afterAddCreated_unknownSurvey });
      await service.addToCreatedSurveys(first_username, unknownSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, { username: first_username, usersSurveys: Users_UserSurveys_afterAddCreated_unknownSurvey });
    });

    it('should throw an error if the user is not found', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(service, 'getExistingUser').mockRejectedValueOnce(new Error('User not found'));
      await expect(service.addToCreatedSurveys(first_username, unknownSurvey)).rejects.toThrow('User not found');
    });
  });


  describe('addToOpenSurveys', () => {
    it('should add a survey to open surveys', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce({ username: first_username, usersSurveys: userSurveys});
      jest.spyOn(service, 'getExistingUser').mockResolvedValueOnce( { username: first_username, usersSurveys: userSurveys });
      jest.spyOn(service, 'updateUser').mockResolvedValueOnce( { username: first_username, usersSurveys: Users_UserSurveys_afterAddOpen_unknownSurvey });
      await service.addToOpenSurveys(first_username, unknownSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, { username: first_username, usersSurveys: Users_UserSurveys_afterAddOpen_unknownSurvey });
    });

    it('should throw an error if the user is not found', async () => {
      // jest.spyOn(userModel, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(service, 'getExistingUser').mockRejectedValueOnce(new Error('User not found'));
      await expect(service.addToOpenSurveys(first_username, unknownSurvey)).rejects.toThrow('User not found');
    });
  });

  describe('populateSurvey', () => {
    const newSurveyId = 23523412341;
    it('should populate survey', async () => {
      jest.spyOn(service, 'addToOpenSurveys').mockResolvedValueOnce();
      await service.populateSurvey(mocked_participants, newSurveyId);
      expect(service.addToOpenSurveys).toHaveBeenCalledTimes(2);
    });
  });
});
