import { Test, TestingModule } from '@nestjs/testing';
import { WiseService } from './wise.service';

describe('WiseService', () => {
  let service: WiseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WiseService],
    }).compile();

    service = module.get<WiseService>(WiseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
