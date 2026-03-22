# crud-api

[Task](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2/03-crud-api/assignment.md)

Simple CRUD API for a Product Catalog using an in-memory database underneath

#### Prerequisites

- Node.js >= 24.10.0
- npm

# Installation

```bash
git clone git@github.com:octo-s/crud-api.git
cd crud-api
npm install
```

# Running
#### Run in development mode
```bash
npm run start:dev
```

### Run in production mode
```bash
npm run start:prod
```

### Run tests
```bash
npm run test
```

#  Using the application
### Get all products
```bash
curl http://localhost:4000/api/products
```

### Create a product
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","description":"Gaming laptop","price":1500,"category":"electronics","inStock":true}'
```

### Get product by ID
```bash
curl http://localhost:4000/api/products/{id}
```
### Update product
```bash
curl -X PUT http://localhost:4000/api/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Laptop","description":"Updated","price":1200,"category":"electronics","inStock":false}'
```

### Delete product
```bash
curl -X DELETE http://localhost:4000/api/products/{id}
```

## Start multiple instances of application
```bash
npm run start:multi
```
