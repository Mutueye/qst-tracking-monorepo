/**
 * InvalidUuidError 不可用的UUID错误类
 */
export class InvalidUuidError extends Error {
  constructor(m?: string) {
    super(m || 'Error: invalid UUID !');

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidUuidError.prototype);
  }
}

// export
export class UUID {
  protected m_str: string;

  constructor(str?: string) {
    this.m_str = str || UUID.newUuid().toString();

    const reg = new RegExp('[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12}', 'i');
    if (!reg.test(this.m_str)) throw new InvalidUuidError();
  }

  toString() {
    return this.m_str;
  }

  public static newUuid(): UUID {
    const uuid = generateUUID();
    return new UUID(uuid);
  }
}

export const generateUUID = () => {
  // Timestamp
  let d = new Date().getTime();
  // Time in microseconds since page-load or 0 if high-precision timer unavailable
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};
