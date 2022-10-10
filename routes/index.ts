import { Router } from 'restify-router'

const router = new Router()
router.get('/', (req, res, next) => {
  res.send({
    name: 'api-pruebas',
    version: '0.0.1',
    description: 'Aplicativo prueba',
  })
  next()
})

export default router
