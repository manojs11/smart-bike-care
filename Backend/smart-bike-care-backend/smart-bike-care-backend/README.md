# Smart Bike Care - Spring Boot + MySQL Backend

This backend was designed from the uploaded React project. It replaces the browser LocalStorage data layer with MySQL while preserving the frontend's main data model and features.

## Main modules
- JWT authentication and BCrypt passwords
- User profile and password change
- Bike CRUD and odometer update
- Service records and service bills
- RC / Insurance / PUC / Licence documents
- Emergency contacts
- Settings and reminder preferences
- Derived service reminders
- Maintenance service and spare-part catalog
- Maintenance recommendations
- Dashboard summary
- Garage API
- Contact form storage

## Database
Create the database once:

```sql
CREATE DATABASE smart_bike_care;
```

Then update `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
app.jwt.secret=YOUR_LONG_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
```

Hibernate will create/update tables automatically with `ddl-auto=update`.

## Run
Use Spring Tools for Eclipse:
1. Import this folder as an Existing Maven Project.
2. Maven Update Project.
3. Run `SmartBikeCareApplication.java` as Spring Boot App.
4. Backend runs on `http://localhost:8080`.

## Frontend integration
Store the JWT returned by `/api/auth/login` and send it with every protected request:

`Authorization: Bearer <token>`

Vite frontend is allowed from `http://localhost:5173`.

## Important file decision
The current React project stores images and document files as Base64 data URLs in LocalStorage. This backend therefore keeps the file data in MySQL `LONGTEXT` columns so the first integration can preserve the existing data shape. For a production deployment, move large files to object storage and store only URLs in MySQL.
