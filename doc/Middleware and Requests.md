# Middleware and Requests

Middleware are small functions that run between the router and the controller. These are typically used for the following reasons:

- To prevent calling the controller function because the request's data is invalid
- Formatting, normalizing or otherwise changing data on the request before calling the controller function
- Logging or tracking activity before allowing the controller function to be called
- Authenticating or denying access to controller functions based on whether the user is signed in or the signed in user's roles
- Providing common extra data onto the request object for use in the controller such as the currently signed in user

Middleware can be easily tacked onto any arbitrary route and reused across many routes, preventing code duplication. It also provides a separate area for common tasks like input validation and formatting, taking that code out of the controller functions, thus making controllers smaller and easier to read.

# Requests

Requests are functionally identical to middleware and use the same namespace. For instance, if you have a middleware called `middleware/someMiddleware.js` and a request called `request/someMiddleware.js`, they will conflict.

Requests are simply middleware with the following differences:

- Typically made for a single controller route
- Typically only do input validation and/or formatting

Requests are generally used within a single route with the purpose of allowing the controller's function to assume the data within the req object is valid to keep the code clean and free of extensive error checking. These functions are stored separately from the rest of the middleware to keep them from cluttering the normal middleware which is normally used across many different controllers.

# Creating Middleware and Requests

You can create middleware and requests by using `smol make <coreName> middleware <middlewareName>` and `smol make <coreName> request <requestName>`.

The naming convention for requests is camelCasing the controller name and function name. For example, for a request definition that validates requests to the `store` method on the `user` controller, you would create `request/userStore.js`. This convention is not required, as requests are specified on the controller by name, not by automatically adding them based on this convention.

# Using Middleware

While the router determines which routes map to which controller functions, the controller itself determines which middleware is called before the controller function is called. This makes it easy to determine what changes are made to the request and what data is expected to be provided to each controller function.

Middleware is defined in the controller's `middleware` object with each key being a controller method name, and each value being that method's expected middleware, in order of execution.

```js
// controller/user.js
middleware: {
  destroy: ['userDestroy', 'hasRole admin'],
  index: ['isSignedIn', 'hasRole admin'],
  show: 'isSignedIn',
  signIn: 'userSignIn',
  store: 'userStore',
}
```

In this example, when the `user` controller's `index` function is called, which is supposed to list all users, the `isSignedIn` function is called first, which checks that the user is signed in (and then provides that data on the `req` object), then the request moves on the to `hasRole` middleware being provided the argument `admin`. Then, assuming neither of those abort the request, the `user` controller's `index` method is finally called, being provided the `req` object.

# Middleware Arguments

Middleware can be provided arguments by adding them to the controller's middleware object separated by spaces. For example, specifying `hasRole admin` will use the `hasRole` middleware. Within that middleware function, `this.args[0]` will be `"admin"`.

# Specific Middleware Documentation

Middleware is documented in doc/Middleware. Requests are not typically documented, but are easy to understand from looking at their code.

# Request Input Validation

It is a common need to validate input data. This is automatically provided via the `req.validate` function which is used within requests made via `smol make <coreName> request`. See Validation doc.

# Generated Requests

It can be useful to use the `faker` npm package to create fake data for requests. For example, you could create a `fakeUserSignUp` middleware that automatically generates a fake email and password, storing them in `req.fields.email` and `req.fields.password` before moving on to the request validation and controller function. You can then call the route via curl or any other client hundreds or even thousands of times to generate many fake users, or for the purposes of load testing.
