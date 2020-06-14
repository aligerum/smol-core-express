# Routing

Define routes in `core/<coreName>/data/routes.js` using the passed in `router` object. Routes are defined by their methods and the name of the class and method to use.

```js
// standard REST routes
router.get('/resource/ticket', 'ticket.index')
router.post('/resource/ticket', 'ticket.store')
router.get('/resource/ticket/:id', 'ticket.show')
router.put('/resource/ticket/:id', 'ticket.update')
router.delete('/resource/ticket/:id', 'ticket.destroy')

// extended routes for multiples and deleting with request fields
router.put('/resource/ticket', 'ticket.updateMultiple')
router.post('/resource/ticket/delete', 'ticket.destroyMultiple')
router.post('/resource/ticket/:id/delete', 'ticket.destroy')
```

You can shortcut creating all of these by calling `router.resource('/resource/ticket', 'ticket')`.

You can also create your own routes outside of these common routes.
