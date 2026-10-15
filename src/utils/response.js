export const ok = (res, data, message = 'OK') =>
  res.status(200).json({ success: true, message, data });

export const created = (res, data, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

export const fail = (res, status, message, errors = null) =>
  res.status(status).json({ success: false, message, errors });