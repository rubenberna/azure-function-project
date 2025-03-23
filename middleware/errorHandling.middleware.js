export default function (handler, allowedMethods) {
  return async function (context, req) {
    if (allowedMethods && !allowedMethods.includes(req.method)) {
      context.res = {
        status: 405,
        body: `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      };
      return;
    }
    try {
      await handler(context, req);
    } catch (err) {
      console.log(err);
      const status = err.name === 'JsonWebTokenError' ? 401 : 400;
      const errorMsg = err && err.message ? err.message : 'A technical error occurred.';
      context.res = {
        status: status,
        body: err && err.response && err.response?.data ? err.response.data : errorMsg
      };
    }
  };
};
