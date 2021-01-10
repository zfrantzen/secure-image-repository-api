const request = require('supertest');
const app = require('../../../server.js');

const imageTestData = require('../../__tests_data__/image.test.data.js');
const userTestData = require('../../__tests_data__/user.test.data.js');
const dbConnection = require('../../config/db.connection.js');

var mockDb;
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

    it('expect image found', async function() {
        mockDb.define('user',  {
            userId: 1,
            pwrd: 'password',
            createdAt: '2019-01-01 13:30:31',
            updatedAt: '2019-01-01 13:30:31'
        });
        
        // Execute test
        const res = await request(app)
            .get('/image?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        // TODO
        let test = 1;
    });
});
