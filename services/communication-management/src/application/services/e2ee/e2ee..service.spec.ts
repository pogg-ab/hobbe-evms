import { Test, TestingModule } from '@nestjs/testing';
import { E2eeService } from './e2ee.service';

describe('E2ee', () => {
  let provider: E2eeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [E2eeService],
    }).compile();

    provider = module.get<E2eeService>(E2eeService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
