import { readStore, createResource, computed } from '@foxtream/core';
import { renderHook, act } from '@testing-library/react-hooks';
import { useStore, useComputed, useResource, useTrack } from '../src';

function createModel() {
  return function Model() {
    return {
      name: 'Dmitry',
      age: 24,
      update(patch: Partial<ReturnType<typeof Model>>) {
        return () => patch;
      },
    };
  };
}

function createResourceModel() {
  return function ResourceModel() {
    return {
      $resource: () => Promise.resolve({ name: 'Dmitry', age: 24 }),
      update(patch: Partial<ReturnType<typeof ResourceModel>>) {
        return () => patch;
      },
    };
  };
}

describe('react', () => {
  let model = createModel();
  beforeEach(() => {
    model = createModel();
  });

  it('should to use store', () => {
    const { result } = renderHook(() => useStore(model));
    expect(result.current).toEqual(
      expect.objectContaining({ name: 'Dmitry', age: 24 }),
    );
  });

  it('should to use computed', async () => {
    const myComputed = computed(() => {
      const { age, name } = readStore(model);
      return `My name is ${name}. I\'m ${age} years old`;
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      useComputed(myComputed),
    );
    expect(result.current).toEqual(`My name is Dmitry. I'm 24 years old`);
    await act(async () => {
      readStore(model).update({ age: 44 });
      await waitForNextUpdate();
      expect(result.current).toEqual(`My name is Dmitry. I'm 44 years old`);
    });
  });

  it('should to use resource', async () => {
    const resource = createResource(createResourceModel());
    try {
      useResource(resource);
    } catch (promise) {
      expect(promise).toBeInstanceOf(Promise);
      await promise;
      const { result, waitForNextUpdate } = renderHook(() =>
        useResource(resource),
      );
      expect(result.current).toEqual(
        expect.objectContaining({ name: 'Dmitry', age: 24 }),
      );
      result.current.update({ age: 44 });
      await waitForNextUpdate();
      expect(result.current).toEqual(
        expect.objectContaining({ name: 'Dmitry', age: 44 }),
      );
    }
  });

  it('should to use track', async () => {
    const spy = jest.fn();
    renderHook(() => useTrack(spy));
    await act(async () => {
      await readStore(model).update({ age: 44 });
      expect(spy.mock.calls[0][0].name).toEqual('Model');
      expect(spy.mock.calls[0][1].name).toEqual('update');
      expect(spy.mock.calls[0][2]).toEqual(
        expect.objectContaining([{ age: 44 }]),
      );
      expect(spy.mock.calls[0][3]).toEqual(
        expect.objectContaining({ name: 'Dmitry', age: 44 }),
      );
    });
  });
});
