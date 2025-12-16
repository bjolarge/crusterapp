CrusterApp project
#to install this, clone from git with the url provided
#run npm install to install packages
#run npm run start:dev to test locally
#create a user 
#login with email and password and get jwt cookies
#make a request to deposit endpoint on transaction to add money
#make a request to a transfer endpoint on transaction controller to send
money to other user in the db

Note: Their is a swagger docs in place (production)
CrusterApp project
#to install this, clone from git with the url provided
#run npm install to install packages
#run npm run start:dev to test locally
#this handles the swagger API part
#http://localhost:3000/api
#create a user 
#login with email and password and get jwt cookies

base URL: http://localhost:3000
#make a POST request to wallet endpoint on wallet controller to create wallet user
#make a POST request to wallet/:id/fund to add fund to the user wallet
#make a POST request to wallet/:id/transfer to transfer fund between wallets
#make a GET request to wallet/:id to check wallet history

For rate limiting, I added throttle globally in the app module as a security mechanism to prevent request abuse
I also have in place class-validator and transformer to prevent wrong data types from being entered into the DB

#To run unit test to test the transaction use:
Note: I mocked the test because the tester would not have access to 
my testing DB

npm run test -- wallet.controller.spec.ts
npm run test -- wallet.service.spec.ts

Note: Their is a swagger docs in place (production)

