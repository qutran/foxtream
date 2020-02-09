import { readStore, initStore, computed } from '../src';
import { raf as baseRaf } from '../src/utils/raf';

const raf = () => new Promise(baseRaf);
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('store', () => {
  it('should initialize store', () => {
    function Model(name: string, age: number) {
      return { name, age };
    }
    initStore(Model, 'Joe', 74);
    const { age, name } = readStore(Model);
    expect(name).toEqual('Joe');
    expect(age).toEqual(74);
  });
  it('should initialize store with default arguments', () => {
    function Model(name: string = 'Joe', age: number = 74) {
      return { name, age };
    }
    const { age, name } = readStore(Model);
    expect(name).toEqual('Joe');
    expect(age).toEqual(74);
  });
  it('should receive previous instance in method', () => {
    const spy = jest.fn();
    function Model(name: string = 'Joe', age: number = 74) {
      return {
        name,
        age,
        update() {
          return spy;
        },
      };
    }
    readStore(Model).update();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Joe', age: 74 }),
    );
  });
  it('should listen for changes with batching update', async () => {
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
    const instance = readStore(Model);
    const unsub = instance.subscribe(spy);
    expect(spy.mock.calls[0][0]).toEqual(
      expect.objectContaining({ name: 'Joe', age: 74 }),
    );
    await raf();
    instance.update({ name: 'Dmitry' });
    instance.update({ name: 'Anna', age: 23 });
    await raf();
    expect(spy.mock.calls.length).toEqual(2);
    expect(spy.mock.calls[1][0]).toEqual(
      expect.objectContaining({ name: 'Anna', age: 23 }),
    );
    unsub();
  });
  it('should correctly proceed asynchronus methods', async () => {
    function Model(name: string = 'Joe', age: number = 74) {
      return {
        name,
        age,
        update(patch: Pick<ReturnType<typeof Model>, 'name' | 'age'>) {
          return async () => {
            await wait(30);
            return patch;
          };
        },
      };
    }
    const instance = readStore(Model);
    await instance.update({ name: 'Dmitry', age: 24 });
    expect(instance).toEqual(
      expect.objectContaining({ name: 'Dmitry', age: 24 }),
    );
  });
  it('should compute value from dependency', async () => {
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
    computed(() => {
      const { name } = readStore(Model);
      return `Hello, ${name}`;
    }).subscribe(spy);
    expect(spy.mock.calls[0][0]).toEqual('Hello, Joe');
    readStore(Model).update({ name: 'Dmitry' });
    readStore(Model).update({ name: 'Dmitry' });
    await raf(); // wait for updating store by model
    await raf(); // wait for computing value and listener dispatching;
    expect(spy.mock.calls[1][0]).toEqual('Hello, Dmitry');
  });
  it('should compute value depended on another computed value', () => {
    function Model(name: string = 'Joe', age: number = 74) {
      return {
        name,
        age,
        update(patch: Pick<ReturnType<typeof Model>, 'name' | 'age'>) {
          return () => patch;
        },
      };
    }
    const greeting = computed(() => {
      const { name } = readStore(Model);
      return `Hello, ${name}`;
    });
    const attention = computed(() => {
      return `${greeting.getValue()}!`;
    });
    expect(attention.getValue()).toEqual('Hello, Joe!');
  });
  it('should destroy computed', async () => {
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
    const cmp = computed(() => {
      return `Hello, ${readStore(Model)}`;
    });
    cmp.subscribe(spy);
    cmp.destroy();
    readStore(Model).update({ name: 'Dmitry' });
    await raf();
    await raf();
    expect(spy.mock.calls.length).toEqual(1);
  });
  it("shouldn't subscribe to computed if was destoted", async () => {
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
    const cmp = computed(() => {
      return `Hello, ${readStore(Model)}`;
    });
    cmp.destroy();
    cmp.subscribe(spy);
    readStore(Model).update({ name: 'Dmitry' });
    await raf();
    await raf();
    expect(spy.mock.calls.length).toEqual(0);
  });
  it('should unsubscribe from computed', async () => {
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
    computed(() => `Hello, ${readStore(Model)}`).subscribe(spy)();
    readStore(Model).update({ name: 'Dmitry' });
    await raf();
    await raf();
    expect(spy.mock.calls.length).toEqual(1);
  });
});
