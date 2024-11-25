This repository handles notes.

## API Description

This API allows users to create, read, update, and delete notes. Each note has a title and text, and is associated with a user. Users must sign up and log in to obtain a token, which is required for authorization.

## Endpoints

- **POST /signup**: Register a new user.
- **POST /login**: Log in and receive a JWT token.
- **GET /notes**: Retrieve all notes for the logged-in user.
- **POST /notes**: Create a new note.
- **PUT /notes/{id}**: Update an existing note.
- **DELETE /notes/{id}**: Delete a note.
- **GET /notes/deleted**: Get id´s and titles of deleted notes.
- **POST /notes/restore/{id}**: Restore a note.

## Usage

1. **Sign Up**: Create a new user by sending a POST request to `/signup` with a JSON body containing `username` and `password`.

2. **Log In**: Obtain a JWT token by sending a POST request to `/login` with a JSON body containing `username` and `password`.

3. **Authorization**: Include the JWT token in the `Authorization` header as `Bearer <token>` for all subsequent requests.

4. **Create Note**: Send a POST request to `/notes` with a JSON body containing `title` and `text`.

5. **Get Notes**: Send a GET request to `/notes` to retrieve all notes for the logged-in user.

6. **Update Note**: Send a PUT request to `/notes/{id}` with a JSON body containing `title` and `text` to update an existing note.

7. **Delete Note**: Send a DELETE request to `/notes/{id}` to soft delete a note.

8. **Get Delete Notes**: Send a GET request to `/notes/deleted` to restore a previously deleted note.

9. **Restore Delete Note**: Send a POST request to `/notes/restore/{id}` to restore a previously deleted note.

## Insomnia File

An Insomnia file with all working calls and endpoints is included in this repository. Import it into Insomnia to quickly test the API.
