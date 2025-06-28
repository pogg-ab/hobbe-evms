import { Test, TestingModule } from '@nestjs/testing';
import { UserAnalyticsController } from './user-analytics.controller';

describe('UserAnalyticsController', () => {
  let controller: UserAnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAnalyticsController],
    }).compile();

    controller = module.get<UserAnalyticsController>(UserAnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
