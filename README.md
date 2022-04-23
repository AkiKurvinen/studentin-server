# StudentIn Server

| Key               | Value                                                          |
| ----------------- | -------------------------------------------------------------- |
| Owner             | Aki Kurvinen                                                   |
| Description       | JSON REST API (Express + PostgreSQL)                           |
| Deploy Server     | https://studentin-server.herokuapp.com                         |
| API Documentation | /doc/index.html                                                |
| also at Swagger   | https://app.swaggerhub.com/apis-docs/Kurvinen/StudentIn/1.0.0/ |
| DB Documentation  | /doc/StudentIn_db_schema.pdf                                   |

## Installation

```
$ npm install
$ docker-compose up -d
$ node create-db
$ node init-db
$ nodemon start
```

## Testing

Command line testing with coverage

```
$ npm test
```

### Local test results

![Local test result coverage](https://github.com/AkiKurvinen/studentin-server/blob/master/screenshots/local_server_test_coverage.JPG)

![Local test result](https://github.com/AkiKurvinen/studentin-server/blob/master/screenshots/jest_local_test.JPG)

## R1

Functioning server and necessary routes

## R2

Bug fixes, testing and documentation

## R3

Google login route
