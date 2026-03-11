/* eslint-disable */
// @ts-nocheck

export default (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
};
