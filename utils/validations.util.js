const validateRequiredParams = (requiredParams, params) => {
  if (!params) throw new Error('Object is empty');
  for (const param of requiredParams) {
    if (!params.hasOwnProperty(param) || !params[param]) throw new Error(`${param} is required`);
  }
};

const validateDataType = (value, desiredDataType) => {
  const validDataTypes = ['string', 'number', 'boolean', 'object', 'function', 'symbol', 'undefined'];
  if (!validDataTypes.includes(desiredDataType)) {
    throw new Error('Invalid desired data type');
  }
  
  const actualDataType = typeof value;
  const matchesDesiredType = actualDataType === desiredDataType;
  if (!matchesDesiredType) throw new Error(`Expected ${desiredDataType} for value ${value}, but got ${actualDataType}`);
};

const genericUtils = {
  validateRequiredParams,
  validateDataType,
};

export default genericUtils;