Requirements:
- node version 20.0.0

Setup:
1. Make sure you have env file. It must have db password that your postgres client has
2. Run `npm install`
3. Run `npx prisma migrate reset`. On message: "Are you sure you want to reset your database? All data will be lost." type "y"
4. Run `npm run dev` to start the server
