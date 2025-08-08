import { SelectQueryBuilder } from 'typeorm';

export function paginate<T>(
  queryBuilder: SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 10,
): SelectQueryBuilder<T> {
  if (page < 1) {
    page = 1;
  }
  if (limit < 1) {
    limit = 10;
  }

  const skip = (page - 1) * limit;
  return queryBuilder.skip(skip).take(limit);
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getPaginatedResults<T>(
  queryBuilder: SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResult<T>> {
  if (page < 1) {
    page = 1;
  }
  if (limit < 1) {
    limit = 10;
  }

  const countQueryBuilder = queryBuilder.clone();

  const total = await countQueryBuilder.getCount();

  const paginatedQuery = paginate(queryBuilder, page, limit);
  const data = await paginatedQuery.getMany();

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
  };
}
