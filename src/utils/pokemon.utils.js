const buildFilter = ({ types, abilities }) => {
  const filter = {};
  if (types) {
    filter.types = { $in: types.split(',').map(type => type.toLowerCase()) };
  }
  if (abilities) {
    filter.abilities = { $in: abilities.split(',').map(ability => ability.toLowerCase()) };
  }
  return filter;
};

const buildPagination = (totalCount, page, limit) => ({
  currentPage: Number(page),
  totalPages: Math.ceil(totalCount / limit),
  totalItems: totalCount,
  limit: Number(limit),
});

const normalizeStrings = (data) => ({
  ...data,
  types: data.types?.map(type => type.toLowerCase()),
  abilities: data.abilities?.map(ability => ability.toLowerCase()),
});

module.exports = {
  buildFilter,
  buildPagination,
  normalizeStrings,
};
