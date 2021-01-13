const request = require('supertest');
const app = require('../../../server.js');
const db = require('../../config/db.config.js');
const resConstants = require('../../constants/response.constants.js');

const imageTestData = require('../../__tests_data__/image.test.data.js');
const userTestData = require('../../__tests_data__/user.test.data.js');
const dbConnection = require('../../config/db.connection.js');

var mockDb
jest.mock('../../config/db.connection.js', () => {
    const SequelizeMock = require('sequelize-mock');
    mockDb = new SequelizeMock();
    return mockDb;
});

describe('GET /image?image-id={target-image-id} (Get image with target-image-id)', function() {  
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    it('expect image found (non-private)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(db.images.build(imageTestData.user1NonprivateFullData));
        
        // Execute test
        const res = await request(app)
            .get('/image?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.type).toEqual(imageTestData.user1NonprivateFullData.type);
        expect(res.text).toEqual('test');
    });

    it('expect image found (private)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(db.images.build(imageTestData.user1PrivateFullData));
        
        // Execute test
        const res = await request(app)
            .get('/image?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.type).toEqual(imageTestData.user1PrivateFullData.type);
        expect(res.text).not.toEqual('test');
    });

    it('expect no image found (non-private)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult([]);
        
        // Execute test
        const res = await request(app)
            .get('/image?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.NOT_FOUND);
        expect(res.body.msg).toEqual('No image with image-id=1 was found');
    });
});
