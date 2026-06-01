import { Hono } from "hono";
import { linkRepository } from "./link.repository";
import { isValidUUID } from "../../utils/validation";
import { AppError } from "../../utils/AppError";
import { linkService } from "./link.service";

const app = new Hono()

app.get('/', async (c) => {
  const { category } = c.req.query()
  const links = await linkRepository.get(category)
  return c.json({
    ok: true,
    data: links
  })
})

app.get('/:linkId', async (c) => {
  const { linkId } = c.req.param()
  if(!isValidUUID(linkId)) throw new AppError(400, 'Invalid ID')
  const link = await linkRepository.getById(linkId)
  if (link) {
    return c.json({
      ok: true,
      data: link
    })
  } else throw new AppError(404, 'Not found')
})

app.post('/', async (c) => {
  const body = await c.req.json()
  if (!body?.url?.trim()) throw new AppError(400, 'Some fields are missing.')
  const createdLink = await linkRepository.create(body.url)
  linkService.enrichLink(createdLink.id)
    .catch(e => console.log(e))
  return c.json(
    {
      ok: true,
      data: createdLink
    },
    201
  )
})

app.patch(':linkId', async (c) => {
  const { linkId } = c.req.param()
  if (!isValidUUID(linkId)) throw new AppError(400, 'Invalid ID')
  const body = await c.req.json()
  if (!body?.title?.trim() && !body?.summary?.trim() && !('isConsumed' in body) && !body?.categoryId) throw new AppError(400, 'No fields provided')
  const updatedLink = await linkRepository.update(linkId, body)
  if (!updatedLink) throw new AppError(404, 'Link not found')
  return c.json({
    ok: true,
    data: updatedLink
  })
})

app.delete('/:linkId', async (c) => {
  const { linkId } = c.req.param()
  if (!isValidUUID(linkId)) throw new AppError(400, 'Invalid ID')
  const deletedLink = await linkRepository.remove(linkId)
  if (deletedLink) {
    return c.json({
      ok: true,
      data: deletedLink
    })
  } else throw new AppError(404, 'Not found')
})

export const linkRoutes = app
