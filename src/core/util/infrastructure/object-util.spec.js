import { ObjectUtil } from './object-util.js';

describe('ObjectUtil unit tests', () => {
  it('should be able to deeply transform an object keys and values', () => {
    expect(
      ObjectUtil.deepObjectTransform(
        { key1: 'Value1', key2: 'Value2', nested: [{ key3: 'Value3' }] },
        (key) => {
          return key.toUpperCase();
        },
        (value) => {
          return typeof value === 'string' ? value.toLowerCase() : value;
        }
      )
    ).toEqual({
      KEY1: 'value1',
      KEY2: 'value2',
      NESTED: [
        {
          KEY3: 'value3'
        }
      ]
    });
  });
});
