# apidevportal
API developer portal
whatsapp me at +1 3095301875

http://ec2-34-205-185-172.compute-1.amazonaws.com:3000/admin-register

<img width="1490" height="1616" alt="image" src="https://github.com/user-attachments/assets/739bcdc0-3ae4-42cd-a7a2-875eb5c7cf70" />
docker cleanup: 
docker-compose down -v --rmi all --remove-orphans && docker system prune -a --volumes -f


update env file inside client folder:
NEXT_PUBLIC_API_URL=http://ec2-34-205-185-172.compute-1.amazonaws.com/:5000/api
NEXT_PUBLIC_REQUIRE_ADMIN_CODE=true

also docker compose file
client:
    build:
      context: ./client
    # Build-time args for Next.js (public at runtime)
      args:
        NEXT_PUBLIC_API_URL: "http://ec2-34-205-185-172.compute-1.amazonaws.com:5001/api"
        NEXT_PUBLIC_REQUIRE_ADMIN_CODE: "true"
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - server

volumes:
  mongo_data:


[ec2-user@ip-172-31-28-82 server]$ cat index.js 
c
  origin: "http://44.204.68.110:3000",  // React app on EC2
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
~                                                                                                                                                                                                                                                    
~                                                                                                                                                                                                                                                    
~                    
