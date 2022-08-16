# Databanken-Project

Repo for databanken project

# Guide

---

## Please follow the below steps to start the application.

1. Download and install "Docker" for your operating system.

2. Make sure you have docker-compose installed along with docker.

3. Open Terminal and move into the "Project" folder.

4. RUN command: docker-compose up

5. Depending upon your internet connection the docker will install everything required to run the whole application

6. Wait until you see in the docker logs that the frontend and backend are up and running

- Backend sample logs:

  Connected to database...
  Connected to Redis...
  Server started on port 4000... (this means that backend API is started on localhost:4000)

- Frontend sample logs:

  Starting the development server...
  webpack compiled (this means the react server is started on localhost:3000)

7. As soon as docker logs above sample logs...the application will be available

   - Frontend on : localhost:3000
   - Backendon : localhost:4000
   - Database : localhost: 27017

Note: you can also connected to MongoDB database on localhost:27017 (using compass or shell)

---

## Super Admin Credentials

The creation of admin is manual. The docker setup will take care of the admin user creation. Please use the below credentials to log in as Admin.

Username: admin@gmail.com
password: 159357

---

## Docker interaction

- docker-compose down (to stop the application)(API & frontend)

- docker-compose up -d (run application without logs)
- docker-compose logs -f (to see the application logs)

---
