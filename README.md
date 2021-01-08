# Image Repository Web App
A simple backend image repository web app powered by NodeJS and PostgreSQL

### Run the application locally
1. Start Docker and run `docker run --name db -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`
2. Then, once the database is active, excecute `npm start`
    - If the database is not yet running, you will get an error stating: "SequelizeConnectionError: Connection terminated unexpectedly"


### How to interact with the backend application
1. Create a new user via `POST localhost:8080/user` (as each image is associated to a user)
2. Upload an image via `POST localhost:8080/image/upload`
TODO: will update once complete


### API Summary
#### User
- `POST localhost:8080/user` 
    - Create a new user. Returns new user id
- `GET localhost:8080/user`
    - Get all users in the database. Returns a list of user objects
