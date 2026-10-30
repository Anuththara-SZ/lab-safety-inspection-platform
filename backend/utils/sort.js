// Whitelisted sorting: ?sort=field or ?sort=-field (descending). Unknown fields fall back to the default.
module.exports = (query, allowed, fallback) => {
  const raw = typeof query.sort === 'string' ? query.sort : fallback;
  const field = raw.startsWith('-') ? raw.slice(1) : raw;
  return allowed.includes(field) ? raw : fallback;
};
