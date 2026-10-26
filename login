curl.exe -s -X POST http://localhost:3000/api/users/login -H "Content-Type: application/json" -d "{\"username\":\"alice\",\"password\":\"password123\"}"

{"message":"Login successful","username":"alice","token":"token-alice-1793045553682"}
