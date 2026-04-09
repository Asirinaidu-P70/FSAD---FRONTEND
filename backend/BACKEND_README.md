# Workshop Management Platform - Backend Setup Guide

## Prerequisites

- Java 17+ (JDK)
- Maven 3.6+
- MySQL 8.0+

## Local Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE workshop_db;
USE workshop_db;
```

### 2. Update Database Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/workshop_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### 3. Build and Run

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The API will run at: `http://localhost:8081/api`

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `GET /api/users/trainers/all` - Get all trainers
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Workshops
- `POST /api/workshops` - Create workshop
- `GET /api/workshops` - Get all workshops
- `GET /api/workshops/{id}` - Get workshop by ID
- `GET /api/workshops/status/{status}` - Get workshops by status
- `GET /api/workshops/category/{category}` - Get workshops by category
- `GET /api/workshops/trainer/{trainerId}` - Get workshops by trainer
- `PUT /api/workshops/{id}` - Update workshop
- `DELETE /api/workshops/{id}` - Delete workshop

### Enrollments
- `POST /api/enrollments` - Enroll user in workshop
- `GET /api/enrollments/{id}` - Get enrollment by ID
- `GET /api/enrollments/user/{userId}` - Get enrollments by user
- `GET /api/enrollments/workshop/{workshopId}` - Get enrollments by workshop
- `PUT /api/enrollments/{id}/complete` - Mark enrollment as complete
- `DELETE /api/enrollments/{id}` - Cancel enrollment

## Deployment to Render

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add Spring Boot backend"
git push
```

### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `workshop-backend`
   - **Environment:** `Docker`
   - **Build Command:** (leave empty - Dockerfile handles it)
   - **Start Command:** (leave empty - Dockerfile handles it)
5. Add **Environment Variables:**
   - **SPRING_DATASOURCE_URL:** `jdbc:mysql://your-mysql-host:3306/workshop_db`
   - **SPRING_DATASOURCE_USERNAME:** `your_db_user`
   - **SPRING_DATASOURCE_PASSWORD:** `your_db_password`
   - **PORT:** `8081`

### Step 3: Set Up MySQL Database

**Option A: Use Render's MySQL (Coming Soon)**

**Option B: Use External Database**
- Use AWS RDS, DigitalOcean Managed MySQL, or similar
- Update `SPRING_DATASOURCE_URL` with your provider's URL

### Step 4: Update Frontend

In your frontend code, update the API URL:

```javascript
// In your frontend .env.production
VITE_API_BASE_URL=https://workshop-backend.onrender.com/api
```

## Database Schema

The application auto-creates tables via JPA:

- `users` - User accounts (User, Trainer, Admin roles)
- `workshops` - Workshop listings
- `enrollments` - User workshop enrollments

## Testing

### Register User
```bash
curl -X POST http://localhost:8081/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Create Workshop
```bash
curl -X POST http://localhost:8081/api/workshops \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Basics",
    "description": "Learn React fundamentals",
    "category": "Web Development",
    "capacity": 30,
    "startDate": "2024-05-01T10:00:00",
    "endDate": "2024-05-05T14:00:00",
    "trainer": {"id": 1}
  }'
```

## Troubleshooting

**Port already in use:**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8082"
```

**Database connection error:**
- Check MySQL is running
- Verify credentials in application.properties
- Ensure database exists

**Build fails:**
```bash
mvn clean
mvn install
```

## Next Steps

1. Connect frontend API calls to these endpoints
2. Implement additional business logic as needed
3. Add authentication/JWT tokens
4. Deploy to Render with MySQL database

For more help: https://render.com/docs
