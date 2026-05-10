export const UPDATABLE_FIELDS = {
  title: 'title',
  categoryId: 'category_id',
  isConsumed: 'is_consumed',
  summary: 'summary'
}

type QueryBuilderOutput = {
  query: string;
  values: unknown[];
}

export const patchLinkQuery = (body: Record<string, unknown>): QueryBuilderOutput => {
  const clauses: string[] = []
  const values: unknown[] = []

  for (const [bodyKey, dbColumn] of Object.entries(UPDATABLE_FIELDS)) {
    if (body[bodyKey] !== undefined) {
      clauses.push(`${dbColumn}=$${values.length + 1}`)
      values.push(body[bodyKey])
    }
  }
  return {
    query: clauses.join(', '),
    values
  }
}
