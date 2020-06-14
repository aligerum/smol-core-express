# Controllers

Controllers are responsible for processing requests to the API and providing a response. Controllers are typically grouped by which database resource they relate to (user, image, etc.).

Methods for working with database resources are handled by their Model. For example, the UserController is not responsible for generating auth tokens for a User. Those methods are part of the User model as they can be generated and used outside the context of a single API request.

While Controllers are responsible for processing an API request and providing a response, the job of validating and formatting user input is offloaded as much as possible to reusable middleware to keep the code within the controller as minimal as possible. In some cases, it's conditional which validation rules are required. In those cases, it is sometimes more convenient to validate the input within the controller, but even middleware is functional and can be used for this purpose.

# Creating Controllers

To make a new controller, use `smol <coreName> make controller <controllerName>`. Controllers are stored in `core/<coreName>/controller/`.

# Methods

Controller methods are called by the Router (see Router doc). The Controller looks at the passed `req` (request) object and provides a response by calling `res.send` on the provided `res` (response) object. The `req` and `res` objects are provided by express.

# Query Parameters, Route Parameters, Files, and Fields

Express Formidable is used to provide request data on the `req` object.

Query parameters from the URL can be accessed using `req.query`. For example, the url `/test?first_name=john&last_name=doe` will have `req.query.first_name` as `"john"`.

Router parameters are provided on `req.params`. For example, if the Router is set to look for `/test/:user/signin` and the client visits `/test/54/signin`, `req.params.user` will be `54`.

Form data added in a POST request is available via `req.fields`. For example, if the client POSTs to `/signin` with an `email` and `password` field provided, those values will be available at `req.fields.email` and `req.fields.password`.

Files are available at `req.files` by name. This works exactly like `req.fields` with POST data, but files are listed in this separate object.

Middleware is also capable of adding additional data into the request (see Middleware and Requests) doc.

# Using Controllers on Routes

(See Router doc).

# Using Controller Middleware and Requests

(See Middleware and Requests doc).
