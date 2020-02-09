import { createResource } from '../src';

function resourceCreator() {
  return {
    $resource: () => Promise.resolve({ value: 42 }),
    increment: () => ({ value }) => ({ value: value + 1 }),
  };
}

function resourceCreatorWithError() {
  return {
    $resource: () => Promise.reject(new Error('error')),
  };
}

describe('createResource', () => {
  it('should thow a promise', () => {
    const resource = createResource(resourceCreator);
    expect(resource.read).toThrow(Promise);
  });

  it('should to throw an error', async () => {
    const resource = createResource(resourceCreatorWithError);
    try {
      resource.read();
    } catch (promise) {
      await promise;
      expect(resource.read).toThrow(Error);
    }
  });

  it('should to read and update data', async () => {
    const resource = createResource(resourceCreator);
    try {
      resource.read();
    } catch (promise) {
      await promise;
      const { increment } = resource.read();
      expect(resource.read().value).toEqual(42);
      increment();
      expect(resource.read().value).toEqual(43);
    }
  });

  it('should return store', async () => {
    const resource = createResource(resourceCreator);
    try {
      resource.read();
    } catch (promise) {
      await promise;
      expect(resource.getValue()).toBeDefined();
    }
  });
});
