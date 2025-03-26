/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import type FrameBufferConfig from '@libs/veyon/types/framebufferConfig';
import VEYON_FEATURE_ACTIONS from '@libs/veyon/constants/veyonFeatureActions';
import VeyonController from './veyon.controller';
import VeyonService from './veyon.service';

const mockData = {
  ip: '192.168.1.1',
  veyonUsername: 'testuser',
  connectionUid: '1234',
  featureUid: VEYON_FEATURE_ACTIONS.SCREENLOCK,
  featureRequestBody: { active: true, connectionUids: ['1234', '5678'] },
  featureResonse: {
    active: 'true',
    name: 'testuser',
    parentUid: '1234',
    uid: '1234',
  },
};

const mockFrameBufferConfig: FrameBufferConfig = {
  format: 'jpeg',
  compression: 1,
  quality: 10,
};

describe('VeyonController', () => {
  let veyonController: VeyonController;
  let veyonService: VeyonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeyonController],
      providers: [
        {
          provide: VeyonService,
          useValue: {
            authenticate: jest.fn(),
            getFrameBufferStream: jest.fn(),
            setFeature: jest.fn(),
            getFeatures: jest.fn(),
          },
        },
      ],
    }).compile();

    veyonController = module.get<VeyonController>(VeyonController);
    veyonService = module.get<VeyonService>(VeyonService);
  });

  it('should be defined', () => {
    expect(veyonController).toBeDefined();
  });

  describe('authentication', () => {
    it('should call VeyonService.authenticate with correct parameters', async () => {
      const expectedResponse = {
        ip: mockData.ip,
        veyonUsername: mockData.veyonUsername,
        connectionUid: mockData.connectionUid,
        validUntil: 1234567890,
      };
      jest.spyOn(veyonService, 'authenticate').mockResolvedValue(expectedResponse);

      const result = await veyonController.authentication(mockData.ip, mockData.veyonUsername, {
        veyonUser: mockData.veyonUsername,
      });

      expect(veyonService.authenticate).toHaveBeenCalledWith(
        mockData.ip,
        mockData.veyonUsername,
        mockData.veyonUsername,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle errors thrown by VeyonService.authenticate', async () => {
      const error = new Error('Authentication failed');
      jest.spyOn(veyonService, 'authenticate').mockRejectedValue(error);

      await expect(
        veyonController.authentication(mockData.ip, mockData.veyonUsername, {
          veyonUser: mockData.veyonUsername,
        }),
      ).rejects.toThrow('Authentication failed');
      expect(veyonService.authenticate).toHaveBeenCalledWith(
        mockData.ip,
        mockData.veyonUsername,
        mockData.veyonUsername,
      );
    });
  });

  describe('streamFrameBuffer', () => {
    it('should get stream, set response headers and pipe the stream to the response', async () => {
      const dummyStream = new Readable({
        read() {
          /* no-op */
        },
      });
      dummyStream.pipe = jest.fn();

      jest.spyOn(veyonService, 'getFrameBufferStream').mockResolvedValue(dummyStream);

      const fakeRes = {
        set: jest.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await veyonController.streamFrameBuffer(mockData.connectionUid, fakeRes as any, mockFrameBufferConfig);

      expect(veyonService.getFrameBufferStream).toHaveBeenCalledWith(mockData.connectionUid, mockFrameBufferConfig);
      expect(fakeRes.set).toHaveBeenCalledWith({
        [HTTP_HEADERS.ContentType]: 'image/jpeg',
        [HTTP_HEADERS.ContentDisposition]: `inline; filename="framebuffer_${mockData.connectionUid}.jpg"`,
      });
      expect(dummyStream.pipe).toHaveBeenCalledWith(fakeRes);
    });

    it('should throw an error if getFrameBufferStream fails', async () => {
      const error = new Error('Stream error');
      jest.spyOn(veyonService, 'getFrameBufferStream').mockRejectedValue(error);

      const fakeRes = {
        set: jest.fn(),
      };

      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        veyonController.streamFrameBuffer(mockData.connectionUid, fakeRes as any, mockFrameBufferConfig),
      ).rejects.toThrow('Stream error');
    });
  });

  describe('setFeature', () => {
    it('should call veyonService.setFeature with correct parameters and return the result', async () => {
      const expectedResponse = { [mockData.connectionUid]: [mockData.featureResonse] };

      jest.spyOn(veyonService, 'setFeature').mockResolvedValue(expectedResponse);

      const result = await veyonController.setFeature(mockData.featureUid, mockData.featureRequestBody);

      expect(veyonService.setFeature).toHaveBeenCalledWith(mockData.featureUid, mockData.featureRequestBody);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if veyonService.setFeature fails', async () => {
      const error = new Error('Failed to set feature');

      jest.spyOn(veyonService, 'setFeature').mockRejectedValue(error);

      await expect(veyonController.setFeature(mockData.featureUid, mockData.featureRequestBody)).rejects.toThrow(
        'Failed to set feature',
      );
    });
  });

  describe('getFeature', () => {
    it('should call veyonService.getFeatures with correct parameter and return the result', async () => {
      const expectedResponse = [mockData.featureResonse];

      jest.spyOn(veyonService, 'getFeatures').mockResolvedValue(expectedResponse);

      const result = await veyonController.getFeatures(mockData.connectionUid);

      expect(veyonService.getFeatures).toHaveBeenCalledWith(mockData.connectionUid);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an error if veyonService.getFeatures fails', async () => {
      const error = new Error('getFeatures error');
      jest.spyOn(veyonService, 'getFeatures').mockRejectedValue(error);

      await expect(veyonController.getFeatures(mockData.connectionUid)).rejects.toThrow('getFeatures error');
    });
  });
});
