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

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
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

    it('expect no image found', async function() {
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

describe('GET /image/info?image-id={target-image-id} (Get image metadata with target-image-id)', function() {  
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('expect image found (non-private)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(db.images.build(imageTestData.user1NonprivateMetadata));
        
        // Execute test
        const res = await request(app)
            .get('/image/info?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('Image with image-id=1 found');
        expect(res.body.detail.name).toEqual(imageTestData.user1NonprivateMetadata.name);
        expect(res.body.detail.type).toEqual(imageTestData.user1NonprivateMetadata.type);
        expect(res.body.detail.userId).toEqual(imageTestData.user1NonprivateMetadata.userId);
    });

    it('expect image found (private)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(db.images.build(imageTestData.user1PrivateMetadata));
        
        // Execute test
        const res = await request(app)
            .get('/image/info?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('Image with image-id=1 found');
        expect(res.body.detail.name).toEqual(imageTestData.user1NonprivateMetadata.name);
        expect(res.body.detail.type).toEqual(imageTestData.user1NonprivateMetadata.type);
        expect(res.body.detail.userId).toEqual(imageTestData.user1NonprivateMetadata.userId);
    });

    it('expect no image found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult([]);
        
        // Execute test
        const res = await request(app)
            .get('/image/info?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.NOT_FOUND);
        expect(res.body.msg).toEqual('No image with image-id=1 was found');
    });

    it('expect failure (incorrect user credential format)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(imageTestData.user1PrivateMetadata);
        
        // Execute test
        const res = await request(app)
            .get('/image/info?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MT1wYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.INVALID_REQUEST);
        expect(res.body.msg).toEqual('Unexpected decoded credentials!');
    });

    it('expect failure (incorrect user password)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(imageTestData.user1PrivateMetadata);
        
        // Execute test
        const res = await request(app)
            .get('/image/info?image-id=1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MjpwYXNzd29yZDE'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.NO_PERMISSION);
        expect(res.body.msg).toEqual('User password is incorrect!');
    });
});

describe('GET /image/info (Get image metadata for all of the requesting user images)', function() {  
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('expect one image found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult([db.images.build(imageTestData.user1NonprivateMetadata)]);
        
        // Execute test
        const res = await request(app)
            .get('/image/info')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('User images found');

        expect(res.body.detail.length).toEqual(1);
        expect(res.body.detail[0].name).toEqual(imageTestData.user1NonprivateMetadata.name);
        expect(res.body.detail[0].type).toEqual(imageTestData.user1NonprivateMetadata.type);
        expect(res.body.detail[0].userId).toEqual(imageTestData.user1NonprivateMetadata.userId);
    });

    it('expect two images found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult([db.images.build(imageTestData.user1PrivateMetadata), db.images.build(imageTestData.user1PrivateMetadata2)]);
        
        // Execute test
        const res = await request(app)
            .get('/image/info')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('User images found');
        
        expect(res.body.detail.length).toEqual(2);
        expect(res.body.detail[0].name).toEqual(imageTestData.user1PrivateMetadata.name);
        expect(res.body.detail[0].type).toEqual(imageTestData.user1PrivateMetadata.type);
        expect(res.body.detail[0].userId).toEqual(imageTestData.user1PrivateMetadata.userId);
        expect(res.body.detail[1].name).toEqual(imageTestData.user1PrivateMetadata2.name);
        expect(res.body.detail[1].type).toEqual(imageTestData.user1PrivateMetadata2.type);
        expect(res.body.detail[1].userId).toEqual(imageTestData.user1PrivateMetadata2.userId);
    });

    it('expect no images found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult([]);
        
        // Execute test
        const res = await request(app)
            .get('/image/info')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.NOT_FOUND);
        expect(res.body.msg).toEqual('No images for user with userId=1 were found');
    });
});

describe('PUT /image/transfer (Transfer image from one user to another)', function() {  
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('expect successfully transfered (non-private)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.users.$queueResult(db.users.build(userTestData.user2));
        db.images.$queueResult(db.images.build(imageTestData.user1NonprivateFullData));
        
        // Execute test
        const res = await request(app)
            .put('/image/transfer')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .field('send-to-user-id', '2')
            .field('image-id', '1');

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('Image with image-id=1 has been transfered');
    });

    it('expect transfer failure (target user not found)', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.users.$queueResult([]);
        
        // Execute test
        const res = await request(app)
            .put('/image/transfer')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .field('send-to-user-id', '2')
            .field('image-id', '1');

        // Check response
        expect(res.statusCode).toEqual(resConstants.NOT_FOUND);
        expect(res.body.msg).toEqual('No user with userId=2 was found');
    });
});

describe('GET /image/info/public (Get image metadata for all public images)', function() { 
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('expect one image found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user2));
        db.images.$queueResult([db.images.build(imageTestData.user1NonprivateMetadata)]);
        
        // Execute test
        const res = await request(app)
            .get('/image/info')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('User images found');

        expect(res.body.detail.length).toEqual(1);
        expect(res.body.detail[0].name).toEqual(imageTestData.user1NonprivateMetadata.name);
        expect(res.body.detail[0].type).toEqual(imageTestData.user1NonprivateMetadata.type);
        expect(res.body.detail[0].userId).toEqual(imageTestData.user1NonprivateMetadata.userId);
    });

    it('expect two images found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user2));
        db.images.$queueResult([db.images.build(imageTestData.user1NonprivateMetadata), db.images.build(imageTestData.user2NonprivateMetadata)]);
        
        // Execute test
        const res = await request(app)
            .get('/image/info')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MjpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('User images found');
        
        expect(res.body.detail.length).toEqual(2);
        expect(res.body.detail[0].name).toEqual(imageTestData.user1NonprivateMetadata.name);
        expect(res.body.detail[0].type).toEqual(imageTestData.user1NonprivateMetadata.type);
        expect(res.body.detail[0].userId).toEqual(imageTestData.user1NonprivateMetadata.userId);
        expect(res.body.detail[1].name).toEqual(imageTestData.user2NonprivateMetadata.name);
        expect(res.body.detail[1].type).toEqual(imageTestData.user2NonprivateMetadata.type);
        expect(res.body.detail[1].userId).toEqual(imageTestData.user2NonprivateMetadata.userId);
    });

    it('expect no images found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult([]);
        
        // Execute test
        const res = await request(app)
            .get('/image/info')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.NOT_FOUND);
        expect(res.body.msg).toEqual('No images for user with userId=1 were found');
    });
});

describe('DELETE /image/{target-image-id} (Deletes an image with image id)', function() { 
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('sucessfully deleted an image', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(db.images.build(imageTestData.user1NonprivateMetadata));
        
        // Execute test
        const res = await request(app)
            .delete('/image/1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('Image with image-id=1 was deleted');
    });

    it('no image found', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult([]);
        
        // Execute test
        const res = await request(app)
            .delete('/image/2')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.NOT_FOUND);
        expect(res.body.msg).toEqual('No image with image-id=2 was found');
    });

    it('no permission to delete image', async function() {
        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        db.images.$queueResult(db.images.build(imageTestData.user2PrivateMetadata));
        
        // Execute test
        const res = await request(app)
            .delete('/image/1')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .send();

        // Check response
        expect(res.statusCode).toEqual(resConstants.NO_PERMISSION);
        expect(res.body.msg).toEqual('No permission');
        expect(res.body.detail).toEqual('Image is private. User does not have permission for this image.')
    });
});

describe('POST /image (Uploads a new image to the db)', function() { 
    afterAll(() => { 
        jest.restoreAllMocks();
        app.close(); 
    });

    afterEach(() => {
        db.users.$clearQueue();
        db.images.$clearQueue();
    });

    it('sucessfully uploaded a private image', async function() {
        const buffer = Buffer.from('../../__tests_data__/image.png');

        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        
        // Execute test
        const res = await request(app)
            .post('/image')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .attach('image', buffer, 'test.png')
            .field('is-private', 1);

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('Image successfully added');
        expect(res.body.detail.imageId).not.toEqual(undefined);
    });

    it('sucessfully uploaded a public image', async function() {
        const buffer = Buffer.from('../../__tests_data__/image.png');

        // Create mocks for test
        db.users.$queueResult(db.users.build(userTestData.user1));
        
        // Execute test
        const res = await request(app)
            .post('/image')
            .set({
                'Accept': 'application/json',
                'Authorization': 'Basic MTpwYXNzd29yZA'
            })
            .attach('image', buffer, 'test.png')
            .field('is-private', 0);

        // Check response
        expect(res.statusCode).toEqual(resConstants.SUCCESS);
        expect(res.body.msg).toEqual('Image successfully added');
        expect(res.body.detail.imageId).not.toEqual(undefined);
    });
});
