export class ObjectUtil {
  /**
   *  Apply transformation on object properties or nested properties
   * @param obj {any}
   * @param keyTransformFn  {(key: string) => string}
   * @param valueTransformFn {(value: any, key?: string) => string}
   */
  static deepObjectTransform(obj, keyTransformFn, valueTransformFn) {
    return Array.isArray(obj)
      ? obj.map((val) => ObjectUtil.deepObjectTransform(val, keyTransformFn, valueTransformFn))
      : typeof obj === 'object'
        ? Object.keys(obj).reduce((acc, current) => {
            const key = keyTransformFn(current);
            const val = valueTransformFn(obj[current], key);
            acc[key] =
              val !== null && typeof val === 'object'
                ? ObjectUtil.deepObjectTransform(val, keyTransformFn, valueTransformFn)
                : val;
            return acc;
          }, {})
        : obj;
  }
}
