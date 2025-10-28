# authentication + server side tasks storage

Evolve the app from a client-only, localStorage-based application to a full-stack application witg authentication and tasks CRUD server. This involves implementing user authentication and storing tasks on a remote server, allowing user data to persist across sessions and devices.

## prerequisites

- Create a configuration file template that would be present in the git repo
- Create a configuration files for local and production environments, and load the correct file during app initialization.
- Add local and production env files to gitignore

## authentication

- Add a new config property with the authentication server host. 
    - local: http://localhost:8000 
    - production: https://groodo-api.greq.me
- the full documentation about the tasks backend and the authentication server can be found [here](https://github.com/gregory-chris/groodo-api/blob/master/README.md) and [here](https://github.com/gregory-chris/groodo-api/blob/master/docs/api-reference.md).

### client side

- keep the current design of the app. all the new features must be aligned with the current UI/UX.
- add a human icon on the top right corner on the top bar. when clicking on the human icon, show a drop down with:
    - if logged in, show the authenticated username and the sign-out link
    - if guest, show sign-in and sign-up links
- sign in/up are done in a modal window
- after a successful sign-up, display a message that a confirmation email was sent, and the sign-in operation will be available after a successful email confirmation.
- display relevant error messages in a readable and convenient way
- all the async operations must have proper in-progress indications. 
- while during an async operation, disable the relevant buttons to avoid redundant requests and possible collisions.
- create a dedicated and robust authentication client module
- store the authentication tokens in a cookie with expiration of 7 days, rather than on the localstorage. Every access to the authentication server extends the expiration of the token to 7 days from the request moment.

## tasks storage

- when on guest mode (not signed in) continue working with localStorage as it is now
- when logged on, work with the remote server. 
Take a look at the api reference for storing and running CRUD operations on tasks. The documentation is [here](https://github.com/gregory-chris/groodo-api/blob/master/docs/api-reference.md)
- when signing-in/out, make a full context switch - reload all the tasks, and continue working with the correct storage (remote or local)
- create a dedicated and robust remote storage client for the server side (similar to the current storage that works with the localStorage)

