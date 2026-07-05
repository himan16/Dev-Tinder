# API list for Dev Tinder

## User Authentication (AUTH ROUTER)

- POST /signup
- POST /login
- POST /logout

## User Profile (PROFILE ROUTER)

- POST /profile/create (image, bio, skills, age, height, QAs)
- GET /profile/view  (self and others)
- PUT /profile/edit (self)
- PUT /profile/changePassword (self)

## Feed (Provides list of users for each) (USERS LIST ROUTERS)

- GET /feed?token=***
- GET /connections (list of users liked each other)
- GET /requests (give newer pending requests at the top)

## CONNECTIONREQUEST ROUTER

Requests send

- POST request/send/interested/:userId
- POST request/send/ignored/:userId

Requests review

- POST /request/review/accepted/:connectionRequestId
- POST /request/review/rejected/:connectionRequestId

## Aspirational

Realtime notifications

- New requests coming (using SSE)
