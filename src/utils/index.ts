export function serializeData(data: any): Record<string, string> {
  const serializedData: Record<string, string> = {};

  Object.keys(data).forEach((key) => {
    const value = data[key];

    if (typeof value === "object") {
      serializedData[key] = JSON.stringify(value);
    } else {
      serializedData[key] = String(value);
    }
  });

  return serializedData;
}
