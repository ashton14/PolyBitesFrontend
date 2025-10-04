# PolyBites
Cal Poly's Campus Dining Food-Rating App

[ER Diagram](https://lucid.app/lucidchart/ad2813b3-f982-40c2-aa4c-77191e8797b9/edit?viewport_loc=185%2C-109%2C2331%2C1015%2C0_0&invitationId=inv_e40c3701-01f5-4a56-b124-3bbf4631b53e)


## Database Config
In polybites-backend, create a .env file. Add the following line with no extra characters or spaces:
DATABASE_URL=postgres://postgres.[TRANSAC-POOL]:[DB-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:[PORT]/postgres
SUPABASE_URL=https://[YOUR-URL].supabase.co
SUPABASE_ANON_KEY=[ANON-PASSWORD]
SERVICE_ROLE_KEY
Your URL may be different. Copy the specific transaction pooler [TRANSAC-POOL] and [PORT] 
connection part in the link under:
Connect -> Transaction pooler   
To get the [DB-PASSWORD]:
Ask owner
Copy and paste the password into the URL
To get [YOUR-URL], go to the left-side task bar and go to API Docs.
To get [ANON_PASSWORD], go to:
Project Settings -> API Keys -> Copy the first link.

IMPORTANT: Make sure that you add a .gitignore file and paste the following inside:
.env

## Running the backend:
cd into polybites-backend
run: npm start 
Go to: http://localhost:5000/api/restaurants
