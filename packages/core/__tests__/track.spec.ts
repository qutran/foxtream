import { track, readStore, untrack } from '../src';

describe('track', () => {
  it('should to track and untrack methods calls', () => {
    const spy = jest.fn();

    function Model(name: string = 'Joe', age: number = 74) {
      return {
        name,
        age,
        update(patch: Pick<ReturnType<typeof Model>, 'name' | 'age'>) {
          return () => patch;
        },
      };
    }

    track(spy);

    readStore(Model).update({ name: 'Dmitry' });

    expect(spy.mock.calls[0][0].name).toEqual('Model');
    expect(spy.mock.calls[0][1].name).toEqual('update');
    expect(spy.mock.calls[0][2]).toEqual([{ name: 'Dmitry' }]);
    expect(spy.mock.calls[0][3]).toEqual(
      expect.objectContaining({ name: 'Dmitry', age: 74 }),
    );

    readStore(Model).update({ age: 24 });

    expect(spy.mock.calls[1][0].name).toEqual('Model');
    expect(spy.mock.calls[1][1].name).toEqual('update');
    expect(spy.mock.calls[1][2]).toEqual([{ age: 24 }]);
    expect(spy.mock.calls[1][3]).toEqual(
      expect.objectContaining({ name: 'Dmitry', age: 24 }),
    );

    untrack(spy);
    readStore(Model).update({ age: 24 });
    expect(spy.mock.calls.length).toEqual(2);
  });
});
