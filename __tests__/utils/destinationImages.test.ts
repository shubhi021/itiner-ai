import {
  getDestinationImage,
  DEFAULT_DESTINATION_IMAGE,
} from '../../src/utils/destinationImages';

describe('destinationImages utility', () => {
  it('returns default fallback image when destination is undefined or empty', () => {
    expect(getDestinationImage()).toBe(DEFAULT_DESTINATION_IMAGE);
    expect(getDestinationImage('')).toBe(DEFAULT_DESTINATION_IMAGE);
  });

  it('matches Lisbon / Portugal queries correctly', () => {
    const img = getDestinationImage('Lisbon, Portugal');
    expect(img).toContain('photo-1585286289943');
  });

  it('matches Tokyo / Japan queries correctly', () => {
    const img = getDestinationImage('Tokyo, Japan');
    expect(img).toContain('photo-1503899036084');
  });

  it('matches Paris / France queries correctly', () => {
    const img = getDestinationImage('Paris, France');
    expect(img).toContain('photo-1502602898657');
  });

  it('matches London / UK queries correctly', () => {
    const img = getDestinationImage('London, UK');
    expect(img).toContain('photo-1513635269975');
  });

  it('matches New York / NYC queries correctly', () => {
    const img = getDestinationImage('New York, NY, USA');
    expect(img).toContain('photo-1496442226666');
  });

  it('matches Rome / Italy queries correctly', () => {
    const img = getDestinationImage('Rome, Italy');
    expect(img).toContain('photo-1552832230');
  });

  it('matches Barcelona / Spain queries correctly', () => {
    const img = getDestinationImage('Barcelona, Spain');
    expect(img).toContain('photo-1539037116277');
  });

  it('matches Bali / Indonesia queries correctly', () => {
    const img = getDestinationImage('Bali, Indonesia');
    expect(img).toContain('photo-1537996194471');
  });

  it('matches Amsterdam / Netherlands queries correctly', () => {
    const img = getDestinationImage('Amsterdam, Netherlands');
    expect(img).toContain('photo-1534351590666');
  });

  it('matches Dubai / UAE queries correctly', () => {
    const img = getDestinationImage('Dubai, UAE');
    expect(img).toContain('photo-1512453979798');
  });

  it('matches Switzerland / Alps queries correctly', () => {
    const img = getDestinationImage('Swiss Alps, Switzerland');
    expect(img).toContain('photo-1530122037265');
  });

  it('falls back to default image for uncurated destinations', () => {
    const img = getDestinationImage('Reykjavik, Iceland');
    expect(img).toBe(DEFAULT_DESTINATION_IMAGE);
  });
});
