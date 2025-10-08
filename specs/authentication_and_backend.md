# authentication + server side tasks storage

currently the tasks are stored locally, in localStorage, what makes that app to be very limited. 
This spec file talks about adding an authentication to that webapp, and store all the tasks on the remote server.

## prerequisites

- Create a configuration file template that would be present in the git repo
- Create a configuration files, one for dev/local and one for the production server, and load the correct file during app bootstrap.
- Add local and production env files to gitignore

## authentication

- Add a new config property with the authentication server host. 
    - local: http://localhost:8000 
    - production: https://groodo-api.greq.me
- the full documentation about the tasks backend and the authentication server can be found [here](https://github.com/gregory-chris/groodo-api/blob/master/README.md) and [here](https://github.com/gregory-chris/groodo-api/blob/master/docs/api-reference.md).

### client side

- add a human icon on the top right corner on the top bar. 
- when clicking on the human icon, show a drop down with:
    - if logged in, show the username and the logout link
    - if guest, show sign in and sign up links
- sign in/up are done in a modal window - make it look great!
- display the relevant error messages in a pretty way

## tasks storage

- when on guest mode (not signed in) continue working with localStorage
- when logged on, work with the remote server. Take a look at the api reference for storing and running CRUD operations on tasks. The documentation is [here](https://github.com/gregory-chris/groodo-api/blob/master/docs/api-reference.md)
- create a dedicated storage client for the server side (similar to the current storage that works with the localStorage)

