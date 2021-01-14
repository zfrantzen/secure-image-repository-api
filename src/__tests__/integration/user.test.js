const request = require('supertest');
const app = require('../../../server.js');
const db = require('../../config/db.config.js');
const resConstants = require('../../constants/response.constants.js');

const userTestData = require('../../__tests_data__/user.test.data.js');

var mockDb;
require('../../config/db.connection.js');
jest.mock('../../config/db.connection.js', () => {
    const SequelizeMock = require('sequelize-mock');
    mockDb = new SequelizeMock();
    return mockDb;
});

describe('POST /user (Create a new user)', function() {  
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('expect new user created', async function() {
        // Execute test
        const res = await request(app)
            .post('/user')
            .set({
                'Accept': 'application/json'
            })
            .field('password', 'testPassword');

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('User successfully generated');
        expect(res.body.detail.userId).toEqual(1);
        expect(res.body.detail.password).toEqual('testPassword');
    });

    it('expect error (password not provided)', async function() {
        // Execute test
        const res = await request(app)
            .post('/user')
            .set({
                'Accept': 'application/json'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.INVALID_REQUEST);
        expect(res.body.msg).toEqual('Request field error!');
        expect(res.body.detail[0][0]).toEqual('Missing expected parameters in body: password');
    });
});

describe('GET /user (Get all users in db)', function() {  
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('expect 1 user found', async function() {
        db.users.$queueResult([db.users.build(userTestData.user1)]);
        
        // Execute test
        const res = await request(app)
            .get('/user')
            .set({
                'Accept': 'application/json'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('All users');
        expect(res.body.detail[0].pwrd).toEqual(userTestData.user1.pwrd);
        expect(res.body.detail[0].id).toEqual(userTestData.user1.id);
    });

    it('expect 2 users found', async function() {
        db.users.$queueResult([db.users.build(userTestData.user1), db.users.build(userTestData.user2)]);
        
        // Execute test
        const res = await request(app)
            .get('/user')
            .set({
                'Accept': 'application/json'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('All users');
        expect(res.body.detail[0].pwrd).toEqual(userTestData.user1.pwrd);
        expect(res.body.detail[0].id).toEqual(userTestData.user1.id);
        expect(res.body.detail[1].pwrd).toEqual(userTestData.user2.pwrd);
        expect(res.body.detail[1].id).toEqual(userTestData.user2.id);
    });

    it('expect 0 users found', async function() {
        db.users.$queueResult([]);
        
        // Execute test
        const res = await request(app)
            .get('/user')
            .set({
                'Accept': 'application/json'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('All users');
        expect(res.body.detail.length).toEqual(0);
    });
});
