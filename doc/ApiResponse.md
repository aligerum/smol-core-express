# ApiResponse

The ApiResponse class is automatically added to all `req` objects. It provides state and a number of functions to conveniently generate standardized api responses that can be handled by a frontend.

For example, let's say you wanted to update a user's email and password. You could do this within the `user` controller:

```js
update(req, res) {
  let user = await User.find(req.fields.userId)
  await user.assign(req.fields, ['email', 'password']).save()
  res.send({
    id: user.id,
    email: user.email,
  })
}
```

That works fine. But you're going to need to remember this layout for every route that returns a user resource, and ensure that the frontend can parse it. Instead, you should standardize packaging the data by giving the user model a function.

```js
update(req, res) {
  let user = await User.find(req.fields.userId)
  await user.assign(req.fields, ['email', 'password']).save()
  res.send(user.packageForApi())
}
```

This works better, but now we also need to be able to return the user's new token as well.

```js
update(req, res) {
  let user = await User.find(req.fields.userId)
  await user.assign(req.fields, ['email', 'password']).save()
  res.send({
    user: user.packageForApi(),
    token: user.createToken(req.fields.password),
  })
}
```

That works. But now we need to change the frontend to be able to handle this. We'll need to update it again to be able to handle things like multiple users being updated and returned:

```js
update(req, res) {
  let user = await User.find(req.fields.userId)
  await user.assign(req.fields, ['email', 'password']).save()
  res.send({
    resource: {
      user: [user.packageForApi()], // now a list so can return multiple
      // could add extra resource types here
    },
    token: user.createToken(req.fields.password),
  })
}
```

With this method, we can return a bunch of different resources together and the frontend can simply call `App.handleResponse(response)` to automatically update all of the resources in it's local storage `appData`. In order to make this even easier, an `apiResponse` object is available on the response object.

```js
update(req, res) {
  let user = await User.find(req.fields.userId)
  await user.assign(req.fields, ['email', 'password']).save()
  await res.apiResponse.addToken(user, req.fields.password)
  await res.apiResponse.addResource(user)
  res.apiResponse.send()
}
```

This `addResource` function automatically calls an `addResource` method defined on the user model that's passed in, which is responsible for returning an object to add to the response. It then automatically puts that object in a `resource` object within a `user` array. This is explained in further detail below.

# Adding Resources

The main purpose of apiResponse is to return resource objects to the frontend. Simply pass in any model and it will map all of its attributes into an object to be returned. You can also add array of models. Mixing of models within the same array is even fine.

If you want to custom package models for sending via ApiResponse, define an async `addResource` method on the model. For example, let's say you have a task app. On the task model, you could define:

```js
async addResource(apiResponse, options = {}) {
  return {
    resource: {
      id: this.id,
      name: this.name,
      isCompleted: this.isCompleted,
    }
  }
}
```

This function will be called for each task that needs to be packaged for the response. The `options` object is passed in from when you call `apiResponse.addResource`, for example, you could call `apiResponse.addResource(task, {withRelatedTasks: true})`.

```js
async addResource(apiResponse, options = {}) {

  // create resource
  let resource = {
    id: this.id,
    name: this.name,
    isCompleted: this.isCompleted,
  }

  // add related tasks to apiResponse
  if (options.withRelatedTasks) {
    let relatedTasks = await this.relatedTasks.get()
    await apiResponse.addResource(relatedTasks)
  }

  // return resource
  return {
    resource,
  }

}
```

Notice you are returning a `resource` object within the returned object. You can also define a `key` and `type` value. Type defines the array within the apiResponse's resource object, for instance, if the type is `task`, it would define a `task` array like so:

```js
{
  resource: {
    task: []
  }
}
```

This is automatically a camelCase version of the models' name if not defined. If you define `type` on the returned object though, it will use that array.

The `apiResponse.addResource` method also automatically ensures there are no duplicates of the same record within that array. By default, it assumes each item within the array should have a unique `id` value. If the model doesn't use `id` as its primary key, you should define the unique key name within `key`.

# Removing Resources

The API also needs to tell the frontend when to remove items. It does this by id. For this, you call `apiResponse.deletedResource(type, id)`. So if you deleted a Task with id 128, you would call `apiResponse.deletedResource('task', 128)`. This would produce the following response:

```js
{
  deletedResource: {
    task: [128],
  },
}
```

# Adding Tokens

You can add a token to the response by calling `apiResponse.addToken(user, password)` where user is a model and password is the new plain text password. This will generate the token for the user and return it within `response.token`. When the frontend receives this, it will automatically update the token stored locally by the client for authentication and immediately begin using it.

# Sending Responses

Once the response has been built, call `res.apiResponse.send()` with no parameters rather than calling `res.send(responseObject)`.

# Accessing req and res

You can access `req` and `res` directly on the apiResponse object via `apiResponse.req` and `apiResponse.res`.

# Custom Data

You can also access the response that will be sent directly by modifying `apiResponse.response`.
