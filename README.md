# Image Repository Web App
A simple backend image repository web app powered by NodeJS and PostgreSQL

### Run the application locally
1. Start Docker and run `docker run --name db -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres`
2. Then, once the database is active, excecute `npm start`
    - If the database is not yet running, you will get an error stating: "SequelizeConnectionError: Connection terminated unexpectedly"


------
### General interaction flow
1. Create a new user via `POST http://localhost:8080/user` (since each image is associated to a user)
2. Upload an image via `POST http://localhost:8080/image`
3. Then you can manipulate the uploaded data (delete, list, etc.) using the various functions listed below in the API summary (i.e. retrieval via `GET http://localhost:8080/image?imageId={imageId}`) 


------
### API Summary
General note: all parameters sent in the body of requests must be in the format of `form-data`
#### User
- `POST http://localhost:8080/user` 
    - Create a new user. Returns the new user id
    - **Request requirements**: no additional fields
- `GET http://localhost:8080/user`
    - Get all users in the database. Returns a list of user objects in the database
    - **Request requirements**: no additional fields

#### Image
- `POST http://localhost:8080/image`
    - Uploads a new image to the database. Returns the imageId of the uploaded image
    - **Request requirements**: 
        - Header: `user-id` (requester's userId) 
        - Body: `image` (file to upload), `is-private` (true or false, sets privacy permission)
- `GET http://localhost:8080/image?image-id={targetImageId}`
    - Gets an uploaded image with imageId {targetImageId} (if the requesting user has permission)
    - **Request requirements**: 
       - Header: `user-id` (requester's userId)
- `GET http://localhost:8080/image/info?image-id={targetImageId}`
    - Gets metadata information of an uploaded image with imageId {targetImageId} (if the requesting user has permission)
    - **Request requirements**: 
        - Header: `user-id` (requester's userId)
- `GET http://localhost:8080/image/info`
    - Gets metadata information of all uploaded image for the requesting user
    - **Request requirements**: 
        - Header: `user-id` (requester's userId)
- `DELETE http://localhost:8080/image/{imageId}`
    - Deletes an image with imageId from the database (if the requesting user has permission)
    - **Request requirements**:
        - Header: `user-id` (requester's userId)





