import { Hono } from "hono";
import { categoryRepository } from "./category.repository";
import { isValidUUID } from "../../utils/validation";
import { AppError } from "../../utils/AppError";

const app = new Hono()

app.get('/', async (c) => {
  const categories = await categoryRepository.get();
  return c.json({
    ok: true,
    data: categories
  })
})

app.post('/', async (c) => {
  const body = await c.req.json()
  if (!body?.name?.trim()) throw new AppError(400, 'Some fields are missing.')
  const createdCategory = await categoryRepository.create(body.name)
  return c.json(
    {
      ok: true,
      data: createdCategory
    },
    201
  )
})

app.delete('/:categoryId', async (c) => {
  const { categoryId } = c.req.param()
  if (!isValidUUID(categoryId)) throw new AppError(400, 'Invalid ID')
  const deletedCategory = await categoryRepository.remove(categoryId)
  if (deletedCategory) {
    return c.json({
      ok: true,
      data: deletedCategory
    })
  } else throw new AppError(404, 'Not found')
})

export const categoryRoutes = app
