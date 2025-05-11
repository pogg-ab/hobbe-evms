import { Test, TestingModule } from '@nestjs/testing';
import { Promocode } from './promocode.service';

describe('Promocode', () => {
  let provider: Promocode;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Promocode],
    }).compile();

    provider = module.get<Promocode>(Promocode);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
